const express = require('express')
const cors = require('cors')
const WebSocket = require('ws')
const Y = require('yjs')

const app = express()

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}))

app.use(express.json())

const CRDT_WS = "wss://crdt-server.onrender.com"

let socket = null
let socketReady = false

// --- Yjs state ---
const doc = new Y.Doc()
const ytext = doc.getText("doc")

// --- WS server for ACE clients ---
const wss = new WebSocket.Server({ port: 4003 })
let clients = new Set()

wss.on('connection', (ws) => {
  console.log("[WS] ACE client connected")
  clients.add(ws)

  ws.on('close', () => {
    console.log("[WS] ACE client disconnected")
    clients.delete(ws)
  })
})

// --- broadcast helper ---
function broadcastFullText() {
  const text = ytext.toString()

  console.log("[BRIDGE → ACE] broadcasting full_text:", text.length)

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "full_text",
        text
      }))
    }
  }
}

// --- WS connect to CRDT ---
function connectWS() {
  socket = new WebSocket(CRDT_WS)

  socket.on('open', () => {
    console.log("Connected to CRDT server")

    socketReady = true

    socket.send(JSON.stringify({
      type: "join",
      docId: "file-1"
    }))
  })

  socket.on('close', () => {
    console.log("WS closed, reconnecting...")
    socketReady = false
    setTimeout(connectWS, 1000)
  })

  socket.on('error', (err) => {
    console.error("WS error:", err.message)
  })

  socket.on('message', (raw) => {
    let msg

    try {
      msg = JSON.parse(raw.toString())
    } catch (e) {
      console.error("[WS] invalid message", e)
      return
    }

    if (msg.type === "update") {

      console.log("[CRDT → BRIDGE] update received")

      const update = new Uint8Array(msg.update)

      Y.applyUpdate(doc, update)

      // 🔥 NOWE: push do ACE
      broadcastFullText()
    }
  })
}

connectWS()

// --- ACE delta helpers ---
function isValidDelta(delta) {
  if (!delta) return false
  if (!delta.action) return false
  if (!delta.start || typeof delta.start.row !== "number") return false
  return true
}

function positionToIndex(delta) {
  let index = 0

  const start = delta.start || { row: 0, column: 0 }
  const lines = delta.lines || []

  for (let i = 0; i < start.row; i++) {
    index += (lines[i]?.length || 0) + 1
  }

  return index + (start.column || 0)
}

function applyDelta(delta) {

  const index = positionToIndex(delta)

  const text = Array.isArray(delta.lines)
    ? delta.lines.join("\n")
    : ""

  if (delta.action === "insert") {
    ytext.insert(index, text)
  }

  if (delta.action === "remove") {
    const len = text.length || 1
    ytext.delete(index, len)
  }
}

// --- ACE → CRDT ---
app.post('/ace-delta', (req, res) => {

  const { deltas } = req.body

  console.log("[ACE → BRIDGE] received:", req.body)

  if (!Array.isArray(deltas)) {
    return res.status(400).json({
      error: "expected deltas array"
    })
  }

  try {

    for (const delta of deltas) {

      if (!isValidDelta(delta)) continue

      applyDelta(delta)
    }

    if (socketReady) {

      const update = Y.encodeStateAsUpdate(doc)

      socket.send(JSON.stringify({
        type: "update",
        update: Array.from(update)
      }))
    }

    return res.json({ ok: true })

  } catch (err) {
    console.error("[BRIDGE ERROR]", err)
    return res.status(500).json({ error: "internal error" })
  }
})

app.listen(4002, () => {
  console.log("Bridge HTTP running on: 4002")
})
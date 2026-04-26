// const WebSocket = require('ws')

// const port = process.env.PORT || 3000
// const server = new WebSocket.Server({ port })

// console.log(`Server running on port ${port}`)

// server.on('status', event => {
//   console.log(event.status)
// })

// server.on('connection', socket => {
//     socket.on('message', message => {
//         console.log(message.toString())
//         socket.send(message.toString())
//     })
// })

// import * as Y from 'yjs'

// const socket = new WebSocket('wss://crdt-server.onrender.com')

// const doc = new Y.Doc()
// const ytext = doc.getText('document')

// // ===== DEBUG: SOCKET STATE =====
// socket.addEventListener('open', () => {
//     console.log('[WS] Connected to server')
// })

// socket.addEventListener('close', () => {
//     console.warn('[WS] Connection closed')
// })

// socket.addEventListener('error', (err) => {
//     console.error('[WS] Error:', err)
// })

// // ===== DEBUG: SEND UPDATES =====
// doc.on('update', update => {
//     console.log('[CRDT] Local update generated:', update.byteLength, 'bytes')

//     if (socket.readyState === WebSocket.OPEN) {
//         socket.send(update)
//         console.log('[WS] Update sent to server')
//     } else {
//         console.warn('[WS] Tried to send, but socket not open')
//     }
// })

// // ===== DEBUG: RECEIVE UPDATES =====
// socket.addEventListener('message', event => {
//     const update = new Uint8Array(event.data)

//     console.log('[WS] Update received:', update.byteLength, 'bytes')

//     Y.applyUpdate(doc, update)

//     console.log('[CRDT] Update applied')
// })

// // ===== INPUT BINDING =====
// const input = document.querySelector('input')

// input.addEventListener('input', () => {
//     doc.transact(() => {
//         console.log('[UI] User input:', input.value)

//         ytext.delete(0, ytext.length)
//         ytext.insert(0, input.value)
//     })
// })

// // ===== RENDER =====
// ytext.observe(() => {
//     const value = ytext.toString()

//     console.log('[CRDT] Document changed → UI update')

//     input.value = value
// })

const { createServer } = require('y-websocket/bin/utils.js')

const port = process.env.PORT || 3000

createServer({ port })

console.log('[WS] y-websocket server running on port', port)
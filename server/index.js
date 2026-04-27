// // const WebSocket = require('ws')

// // const port = process.env.PORT || 3000
// // const server = new WebSocket.Server({ port })

// // console.log(`Server running on port ${port}`)

// // server.on('status', event => {
// //   console.log(event.status)
// // })

// // server.on('connection', socket => {
// //     socket.on('message', message => {
// //         console.log(message.toString())
// //         socket.send(message.toString())
// //     })
// // })

// const { WebSocketServer } = require('ws')
// const Y = require('yjs')

// const wss = new WebSocketServer({
//   port: process.env.PORT || 3000
// })

// // docId -> Y.Doc
// const docs = new Map()

// function getDoc(docId) {
//   if (!docs.has(docId)) {
//     const doc = new Y.Doc()
//     docs.set(docId, doc)
//   }
//   return docs.get(docId)
// }

// console.log('[WS] CRDT server running')

// wss.on('connection', (ws) => {
//   let currentDocId = null
//   let doc = null

//   ws.on('message', (raw) => {
//     let msg

//     try {
//       msg = JSON.parse(raw.toString())
//     } catch (e) {
//       console.error('Invalid message:', e)
//       return
//     }

//     // JOIN DOC
//     if (msg.type === 'join') {
//       currentDocId = msg.docId
//       doc = getDoc(currentDocId)

//       console.log('[WS] client joined:', currentDocId)
//       return
//     }

//     // CRDT UPDATE
//     if (msg.type === 'update') {
//       if (!doc) return

//       const update = new Uint8Array(msg.update)

//       // apply update to server state
//       Y.applyUpdate(doc, update)

//       // broadcast to others
//       wss.clients.forEach(client => {
//         if (client !== ws && client.readyState === 1) {
//           client.send(JSON.stringify({
//             type: 'update',
//             docId: currentDocId,
//             update: msg.update
//           }))
//         }
//       })
//     }

//     if (msg.type === 'ace_delta') {
//       console.log('[ACE DELTA]', msg.delta)
//       // opcjonalnie ACK
//       ws.send(JSON.stringify({
//         type: 'ack',
//         status: 'received'
//       }))

//       return
//     }
//     ws.on('close', () => {
//       console.log('[WS] client disconnected')
//     })
//   })
// })

const { WebSocketServer } = require('ws')
const Y = require('yjs')

const wss = new WebSocketServer({
  port: process.env.PORT || 3000
})

// docId -> Y.Doc
const docs = new Map()

function getDoc(docId) {
  if (!docs.has(docId)) {
    const doc = new Y.Doc()
    docs.set(docId, doc)
  }
  return docs.get(docId)
}

console.log('[WS] Yjs CRDT server running')

wss.on('connection', (ws) => {

  let currentDocId = null
  let doc = null

  ws.on('message', (raw) => {

    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch (e) {
      console.error('Invalid message:', e)
      return
    }

    // 1. JOIN
    // if (msg.type === 'join') {
    //   currentDocId = msg.docId
    //   doc = getDoc(currentDocId)

    //   console.log('[WS] client joined:', currentDocId)
    //   return
    // }
    if (msg.type === 'join') {

      currentDocId = msg.docId
      doc = getDoc(currentDocId)

      ws.docId = currentDocId

      const state = Y.encodeStateAsUpdate(doc)

      ws.send(JSON.stringify({
        type: "sync",
        update: Array.from(state)
      }))

      console.log('[WS] client joined:', currentDocId)

      return
    }

    // 2. YJS UPDATE (CORE PROTOKÓŁ)
    if (msg.type === 'update') {
      if (!doc) return

      const update = new Uint8Array(msg.update)
      console.log('[WS] client sent update on', currentDocId)
      // apply CRDT update
      Y.applyUpdate(doc, update)

      // broadcast do innych klientów
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'update',
            docId: currentDocId,
            update: msg.update
          }))
        }
      })

      return
    }

    // 3. ACK (opcjonalne)
    if (msg.type === 'ack') {
      console.log('[WS] ack:', msg)
      return
    }

  })

  ws.on('close', () => {
    console.log('[WS] client disconnected')
  })

})
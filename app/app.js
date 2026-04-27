import * as Y from 'https://esm.sh/yjs'

const socket = new WebSocket('wss://crdt-server.onrender.com')

const doc = new Y.Doc()
const ytext = doc.getText('doc')

// ===== JOIN ROOM =====
socket.addEventListener('open', () => {
    console.log('[WS] connected')

    socket.send(JSON.stringify({
        type: 'join',
        docId: 'file-1'
    }))
})

// ===== SEND CRDT UPDATES =====
doc.on('update', (update) => {
    console.log('[CRDT] local update')

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'update',
            update: Array.from(update) // ważne: serializacja
        }))
    }
})

// ===== RECEIVE UPDATES =====
socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)

    if (msg.type === 'update') {
        const update = new Uint8Array(msg.update)

        console.log('[WS] remote update received')
        console.log(update.length)

        Y.applyUpdate(doc, update)
        console.log(doc.getText("doc").toString())
    }
})

// ===== UI =====
const input = document.querySelector('input')
const p = document.querySelector('p')

// UI → CRDT
input.addEventListener('input', () => {
    doc.transact(() => {
        ytext.delete(0, ytext.length)
        ytext.insert(0, input.value)
    })
})

// CRDT → UI
ytext.observe(() => {
    input.value = ytext.toString()
    p.textContent = ytext.toString()
})
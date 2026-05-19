//
// Server setup
//

// Send file
const express = require("express")
const http = require("http")
const { WebSocketServer } = require('ws')

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.use(express.static("public"))
app.get("/api/docs", (req, res) => {
    res.json({
        docs: Array.from(serverEditors.keys()),
        time: Date.now()
    })
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

//  Requirements
require("amd-loader")
const { MockRenderer } = require("./load_ace.js")
const { ServerEditor, Cursor } = require("./classes.js")

// Map of documents
const serverEditors = new Map()

function getServerEditor(docId){
    if(!serverEditors.has(docId)){
        serverEditors.set(docId, createServerEditor())
    }
    return serverEditors.get(docId) || null
}

function createServerEditor(){
    return {
        serverEditor: new ServerEditor(),
        revision: -1,
        history: [],
        clients: [],
        cursors: [],
        newId: 0
    }
}

// Setup
function getAllConnectedClientsIds(){
    const clientsIds = []

    wss.clients.forEach(client => {
        clientsIds.push(client.clientId)
    })

    return clientsIds
}

function removeInactiveClients(se) {
    let clientsToRemove = []

    se.clients.forEach(client => {
        if (!connectedClients.includes(client)){
            clientsToRemove.push(client)
        }
    })

    if (clientsToRemove)
        clientsToRemove.forEach(client => {
            se.clients = se.clients.filter(clientId => 
                clientId !== client
            )

            se.cursors = se.cursors.filter(cursor => 
                cursor.clientId !== client
            )

            wss.clients.forEach(ws => {
                if (se.clients.includes(ws.clientId)){
                    ws.send(JSON.stringify({
                        type: 'removeCursor',
                        clientId: client
                    }))
                }
            })
        })
        
    delete(clientsToRemove)
}

// Check status of each server editor
setInterval(() => {
    connectedClients = getAllConnectedClientsIds()
    serverEditors.forEach((se, key) => {
        removeInactiveClients(se)

        console.log(`Document "${key}": ${se.clients.length} clients connected.`)
        if (se.clients.length === 0)
            serverEditors.delete(key)
    })
}, 10000)

//  Handle messages
wss.on('connection', ws => {
    ws.on("message", raw => {
        let msg

        try {
            msg = JSON.parse(raw.toString());
        } catch (err) {
            console.error('[WSS] Invalid JSON:', err)
            return
        }

        const { type, docId, clientId } = msg

        if (!docId || !clientId) {
            console.error(`[WSS] Missing required fields in ${type} message.`)
            console.log(msg)
            return
        }

        const se = getServerEditor(docId)

        // Handshake
        if (type === 'hello') {
            const { currentText, cursorPosition } = msg
            
            ws.clientId = clientId

            se.clients.push(clientId)
            se.cursors.push(new Cursor(clientId, cursorPosition, se.newId))
            se.newId += 1
            if (se.revision === -1){
                se.serverEditor.setValue(currentText)
                se.revision = 0
            }

            const out = JSON.stringify({
                type: 'snapshot',
                docId: docId,
                lines: se.serverEditor.getValue(),
                revision: se.revision,
                markers: se.cursors
            })

            ws.send(out)

            console.log(`[WSS] Client ${clientId} connected to doc ${docId}.`)
            return
        }

        // Adieu
        if (type === 'bye'){      
            se.clients = se.clients.filter(client => 
                client !== clientId
            )

            console.log(`[WSS] Client ${clientId} disconnected from doc ${docId}.`)
            return
        }

        // New changes query
        if (type === 'delta') {
            const { docId, clientId, opId, baseRevision, delta } = msg
            
            if (!se.clients.includes(clientId)){
                console.log(`[WSS] Client ${clientId} not connected to ${docId}, ignoring...`)

                return
            }

            // if (baseRevision < se.revision) {
            //     let transformed = msg.delta
            //     for (let i = baseRevision; i < se.history.length; i++) {
            //         const applied = se.history[i].delta
            //     }
            //     msg.delta = transformed
            //     msg.baseRevision = se.revision
            // }

            se.serverEditor.getDocument().applyDeltas(delta)
            se.revision += 1
            se.history.push({
                revision: se.revision,
                clientId: clientId,
                opId: opId,
                delta: delta
            })

            const out = JSON.stringify({
                type: 'delta',
                docId: docId,
                sourceClientId: clientId,
                opId: opId,
                revision: se.revision,
                delta: delta
            })

            for (const client of wss.clients) {
                if (!se.clients.includes(client.clientId))
                    continue

                if (client.readyState === 1 && client.clientId != clientId) 
                    client.send(out)
            }

            console.log(`[WSS] Recieved a "delta" message from ${clientId} on file ${docId}.`)
            return
        }

        // Send positions of clients cursors
        // TODO: Could be optimized
        if (type === 'cursor'){
            const { cursorPosition } = msg

            se.cursors.forEach(cursor => {
                if (cursor.clientId == clientId){
                    cursor.setPosition(cursorPosition)

                    const out = JSON.stringify({
                        type: 'cursor',
                        docId: docId,
                        marker: cursor
                    })

                    for (const client of wss.clients) {
                        if (!se.clients.includes(client.clientId))
                            continue

                        if (client.readyState === 1 && client.clientId != clientId) 
                            client.send(out)
                    }

                    return
                }
            })

            return
        }

        // Ignore unrelated queries
        console.log(`[WSS] Got a weird message of type ${type}.`)
        return
    })
})

server.listen(process.env.PORT || 3000)
console.log(`[WSS] Server opened.`)

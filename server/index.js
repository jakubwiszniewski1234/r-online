//
// Headless ACE
//

//  Requirements
require("amd-loader")

const ace_modules_folder = "./ace_modules"
global.ace = require(ace_modules_folder + "/ace.js")
require(ace_modules_folder + "/test/mockdom")

const MockRenderer = require(ace_modules_folder + "/test/mockrenderer").MockRenderer
const Editor = require(ace_modules_folder + "/editor").Editor
const EditSession = require(ace_modules_folder + "/edit_session").EditSession
const Document = require(ace_modules_folder + "/document").Document
const Delta = require(ace_modules_folder + "/document").Delta

//  Setup
const renderer = new MockRenderer()
const editor = new Editor(renderer)


// Map of documents
const docs = new Map();

function createDoc(initialDoc) {
    return {
        doc: new Document(initialDoc.getValue()),
        revision: 0,
        history: []
    }
}

function ensureDoc(docId, initialDoc) {
    if (!docs.has(docId)) {
        docs.set(docId, createDoc(initialDoc))
    }
    return docs.get(docId)
}

function getDoc(docId) {
    return docs.get(docId) || null
}


//
// Server setup
//

// Setup
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({
    port: process.env.PORT || 3000
})

//  Handle messages
function handleHello(ws, msg) {
    const { docId, clientId, currentText } = msg

    if (!docId || !clientId) {
        console.error('Missing required fields in hello message')
        return
    }

    ws.docId = docId
    ws.clientId = clientId

    const doc = ensureDoc(docId, currentText)

    console.log(`Client ${clientId} connected to doc ${docId}`)

    ws.send(JSON.stringify({
        type: 'snapshot',
        docId,
        text: doc.doc.text,
        revision: doc.revision
    }));
}

wss.on('connection', ws => {
    ws.on("message", raw => {
        let msg

        try {
            msg = JSON.parse(raw.toString());
        } catch (err) {
            console.error('Invalid JSON:', err)
            return
        }

        // Handshake
        if (msg.type === 'hello') {
            console.log("Got hello message")
            handleHello(ws, msg)
            return
        }

        // New changes query
        if (msg.type === 'delta') {
            if (!ws.docId) ws.docId = msg.docId
            console.log(`Recieved a "delta" message from ${ws.clientId} on file ${ws.docId}.`)

            const doc = getDoc(ws.docId)

            if (msg.baseRevision < doc.revision) {
                
                let transformed = msg.delta;
                for (let i = msg.baseRevision; i < doc.history.length; i++) {
                    const applied = doc.history[i].delta;
                    
                }
                msg.delta = transformed;
                msg.baseRevision = doc.revision;
            }

            doc.doc.applyDeltas(msg.delta)
            doc.revision += 1
            doc.history.push({
                revision: doc.revision,
                clientId: msg.clientId,
                opId: msg.opId,
                delta: msg.delta
            });


            const out = JSON.stringify({
                type: 'delta',
                docId: msg.docId,
                sourceClientId: msg.clientId,
                opId: msg.opId,
                revision: doc.revision,
                delta: msg.delta
            });

            for (const client of wss.clients) {
              if (client.readyState === 1 && client.clientId != msg.clientId) client.send(out);
            }

            return
        }

        // Ignore unrelated queries
        if (msg.type !== 'delta') {
            console.log(`Got a weird message of type ${msg.type}.`)
            return
        }
    })
})

console.log(`[WSS] Server opened.`);
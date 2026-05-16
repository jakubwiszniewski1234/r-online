//
//  R Online client
//

// Credentials
const docId = "main"
const serverURL = "http://localhost:3000"
const clientId = crypto.randomUUID()
// const serverURL = 'https://crdt-server.onrender.com'

// Find focused editor
// const { getCurrentSourceEditor } = require("./find_editor.js")
// const editor = getCurrentSourceEditor()
var allEditors = document.querySelectorAll(".ace_editor")
for (var i = 0; i < allEditors.length; i++){
    el = allEditors[i]
    console.log(el)
    if (el.id.includes("rstudio_source_text_editor")){
        if (el.checkVisibility() == true){
            var editor_element = ace.edit(el)
            break
        }
    }
}

const editor = editor_element

const Range = ace.require("ace/range").Range
const { row, column } = editor.getCursorPosition()

const style = document.createElement("style");
style.textContent = `
  .ace_cursor_modifier {
}
`
document.head.appendChild(style)


// Other clients markers
const clientMarkers = new Map()

function drawMarker(clientId){
    const marker = clientMarkers.get(clientId)
    const { row, column } = marker.position
    editor.session.$markerId = marker.id
    const markerId = editor.session.addMarker(
        new Range(row, column, row, column + 0.01),
        "ace_cursor ace_cursor_modifier",
        "text",
        false
    )
}

function removeMarker(clientId){
    const marker = clientMarkers.get(clientId)
    editor.session.removeMarker(marker.id)

    clientMarkers.delete(clientId)
}

const ws = new WebSocket(serverURL)

let revision = 0
let applyingRemote = false

function applyRemote(func) {
    applyingRemote = true
    func()
    applyingRemote = false
}

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'hello',
        docId: docId,
        clientId: clientId,
        currentText: editor.session.getValue(),
        cursorPosition: editor.getCursorPosition()
    }))
}

ws.onclose = () => {
    ws.send(JSON.stringify({
        type: 'bye',
        docId: docId,
        clientId: clientId
    }))
}

// Applied changes
let pendingDeltas = []
let debounceEditorTimer
editor.session.on('change', delta => {
    if (applyingRemote) return

    pendingDeltas.push(delta)
    clearTimeout(debounceEditorTimer)
    debounceEditorTimer = setTimeout(() => {
        ws.send(JSON.stringify({
            type: 'delta',
            docId: docId,
            clientId,
            opId: crypto.randomUUID(),
            baseRevision: revision,
            delta: pendingDeltas
        }))

        pendingDeltas = []
    }, 30)
})

// Cursor movement 
let debounceCursorTimer
editor.selection.on("changeCursor", function() {
  const cursorPos = editor.getCursorPosition()

  clearTimeout(debounceCursorTimer)
  debounceCursorTimer = setTimeout(() => {
    console.log(cursorPos)
    ws.send(JSON.stringify({
        type: 'cursor',
        docId: docId,
        clientId: clientId,
        cursorPosition: cursorPos
    }))
  }, 300)
})

ws.onmessage = ev => {
    const msg = JSON.parse(ev.data)
    const { type } = msg

    if (type === 'snapshot') {
        applyRemote(() => {
            editor.setValue(msg.lines, -1)
            revision = msg.revision
        })
        
        msg.markers.forEach(marker => {
            if (!marker.clientId == clientId){
                clientMarkers.set(marker.clientId, { 
                    position: marker.position, 
                    id: marker.id 
                })
            }
        })

        clientMarkers.forEach((marker, clientId) => {
            drawMarker(clientId)
        })

        return
    }

    if (type === 'delta') {
        if (msg.sourceClientId === clientId) {
            revision = msg.revision
            return
        }

        console.log(delta)

        if (docId != docId){
            console.log(`[LOCAL] Document ${docId} caught a message sent to ${msg.docId}, ignoring...`)
            return
        }

        applyRemote(() => {
            editor.session.getDocument().applyDeltas(msg.delta);
            revision = msg.revision;
        })

        return
    }

    if (type === 'cursor') {
        const { clientId, position, id } = msg.marker

        if (!clientMarkers.has(clientId)){
            clientMarkers.set(clientId, {
                position: position,
                id: id
            })
        }

        marker = clientMarkers.get(clientId)
        marker.position = position
        drawMarker(clientId)

        return
    }

    if (type === "removeCursor") {
        const { clientId } = msg
        removeMarker(clientId)
    }
};

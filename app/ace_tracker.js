const docId = "main"

// Find focused editor
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

// Get server URL from user
// let inputServerElement = document.createElement("textarea")
// inputServerElement.style.padding = '30px'
// inputServerElement.style.border = '20px solid black'
// inputServerElement.style.backgroundColor = 'rgba(132, 255, 164, 1)'
// inputServerElement.value = "TEST"
// inputServerElement.style.zIndex = "100000"
// inputServerElement.style.position = "absolute"
// editor.container.appendChild(inputServerElement)

// var serverURL
// var ws_temp
// inputServerElement.addEventListener("change", () => {
//     serverURL = inputServerElement.value
//     console.log(serverURL)
//     try{
//         const ws = new WebSocket(serverURL)
//         // its an event listener so later code will compute anyway
//     } catch (e) {
//         console.log(e.name, e.message)
//     }
// })

// editor.container.appendChild(inputServerElement)

// const ws = new WebSocket('https://crdt-server.onrender.com')
const ws = new WebSocket('http://localhost:3000')

const clientId = crypto.randomUUID();
let revision = 0;
let applyingRemote = false;

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


let pendingDeltas = []
let debounceEditorTimer

editor.session.on('change', delta => {
    if (applyingRemote) return

    pendingDeltas.push(delta)
    
    clearTimeout(debounceEditorTimer)
    debounceEditorTimer = setTimeout(() => {
        console.log(pendingDeltas)
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

let debounceCursorTimer

editor.selection.on("changeCursor", function() {
  const cursorPos = editor.getCursorPosition()
  console.log(cursorPos.row, cursorPos.column)

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
    const msg = JSON.parse(ev.data);

    if (msg.type === 'snapshot') {
        console.log(msg.lines)

        applyingRemote = true;
        editor.setValue(msg.lines, -1)
        revision = msg.revision
        applyingRemote = false
        
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

    if (msg.type === 'delta') {
        if (msg.sourceClientId === clientId) {
            revision = msg.revision
            return
        }

        console.log(msg.delta)

        if (msg.docId != docId){
            console.log(`[LOCAL] Document ${docId} caught a message sent to ${msg.docId}, ignoring...`)
            return
        }

        applyingRemote = true;
        editor.session.getDocument().applyDeltas(msg.delta);
        revision = msg.revision;
        applyingRemote = false;

        return
    }

    if (msg.type === 'cursor') {
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

    if (msg.type === "removeCursor") {
        const { clientId } = msg
        removeMarker(clientId)
    }
};

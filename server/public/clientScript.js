//
//  R Online client
//

// Requirements
const Range = ace.require("ace/range").Range

// Find focused editor
function getEditor(){
    let allEditors = document.querySelectorAll(".ace_editor")
    for (let i = 0; i < allEditors.length; i++){
        el = allEditors[i]
        if (el.id.includes("rstudio_source_text_editor")){
            if (el.checkVisibility() == true){
                var editor_element = ace.edit(el)
                return editor_element
            }
        }
    }
}

const editor = getEditor()

class Client{
    constructor(){
        this.clientId = "guest_" + crypto.randomUUID().substring(0, 6)
        this.serverURL = "http://localhost:3000" // "https://crdt-server.onrender.com" 
        this.docId = "main"
        this.cursorDelay = 30
        this.deltaDelay = 30
        this.revision = 0
        this.handleMessage = {
            'snapshot': msg => this.handleSnapshot(msg),
            'delta': msg => this.handleDelta(msg),
            'cursor': msg => this.handleCursor(msg),
            'removeCursor': msg => this.handleRemoveCursor(msg)
        }
        this.applyingRemote = false
    }

    applyRemote(func){
        this.applyingRemote = true
        func()
        this.applyingRemote = false
    }

    setCredentials(data){
        const { clientId, serverURL, docId } = data
        this.clientId = ( clientId ? clientId : this.clientId )
        this.serverURL = ( serverURL ? serverURL : this.serverURL )
        this.docId = ( docId ? docId : this.docId )
    }
    
    connect(){
        this.ws = ( this.ws ? this.ws : new WebSocket(this.serverURL) )
        const ws = this.ws

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'hello',
                docId: this.docId,
                clientId: this.clientId,
                currentText: editor.session.getValue(),
                cursorPosition: editor.getCursorPosition()
            }))
        }

        // Applied changes
        this.pendingDeltas = []
        this.debounceEditorTimer = 0
        editor.session.on('change', this.handler1)

        // Cursor movement 
        this.debounceCursorTimer = 0
        editor.selection.on("changeCursor", this.handler2)

        // Handle recieved messages
        ws.onmessage = ev => {
            const msg = JSON.parse(ev.data)
            const { type } = msg

            this.handleMessage[type](msg)

            return
        }

    }

    sendDeltaChanges(delta) {
        if (this.applyingRemote) return

        this.pendingDeltas.push(delta)
        clearTimeout(this.debounceEditorTimer)
        this.debounceEditorTimer = setTimeout(() => {
            this.ws.send(JSON.stringify({
                type: 'delta',
                docId: this.docId,
                clientId: this.clientId,
                opId: crypto.randomUUID(),
                baseRevision: this.revision,
                delta: this.pendingDeltas
            }))

            this.pendingDeltas = []
        }, this.deltaDelay)
    }

    sendCursorChange(delay) {
        clearTimeout(this.debounceCursorTimer)
        this.debounceCursorTimer = setTimeout(() => {
            this.ws.send(JSON.stringify({
                type: 'cursor',
                docId: this.docId,
                clientId: this.clientId,
                cursorPosition: editor.getCursorPosition()
            }))
        }, delay)
    }

    handleSnapshot(msg) {
        this.applyRemote(() => {
            editor.setValue(msg.lines, -1)
            this.revision = msg.revision
        })

        msg.markers.forEach(marker => {
            if (!marker.clientId == this.clientId) {
                clientMarkers.set(marker.clientId, {
                    position: marker.position,
                    id: marker.id
                })
            }
        })

        clientMarkers.forEach((marker, clientId) => {
            drawMarker(clientId)
        })
    }

    handleDelta(msg){
        if (msg.sourceClientId === this.clientId) {
            this.revision = msg.revision
            return
        }

        if (msg.docId != this.docId){
            console.log(`[LOCAL] Document ${this.docId} caught a message sent to ${msg.docId}, ignoring...`)
            return
        }

        this.applyRemote(() => {
            editor.session.getDocument().applyDeltas(msg.delta)
            this.revision = msg.revision
            drawMarker(msg.sourceClientId)
        })
    }

    handleCursor(msg){
        if (!clientMarkers.has(msg.marker.clientId)){
            clientMarkers.set(msg.marker.clientId, {
                position: msg.marker.position,
                id: msg.marker.id
            })
        }

        console.log(msg)

        const marker = clientMarkers.get(msg.marker.clientId)
        marker.position = msg.marker.position
        drawMarker(msg.marker.clientId)
    }

    handleRemoveCursor(msg) {
        removeMarker(msg.clientId)
    }

    disconnect(){
        this.ws.send(JSON.stringify({
            type: 'bye',
            docId: this.docId,
            clientId: this.clientId
        }))

        editor.session.off('change', this.handler1)
        editor.selection.off("changeCursor", this.handler2)

        this.ws.send(JSON.stringify({
            type: 'bye',
            docId: this.docId,
            clientId: this.clientId
        }))

        delete(this.ws)
    }

    handler1 = delta => this.sendDeltaChanges(delta)
    handler2 = () => this.sendCursorChange()
}

const client = new Client()

// Other clients markers
const clientMarkers = new Map()

const style = document.createElement("style");
style.textContent = `
  .ace_cursor_modifier {
  width: 100px;
}
`
document.head.appendChild(style)

function drawMarker(clientId){
    const marker = clientMarkers.get(clientId)
    const { row, column } = marker.position
    editor.session.$markerId = marker.id
    const markerId = editor.session.addMarker(
        new Range(row, column, row, column + .1),
        "ace_cursor ace_cursor_modifier",
        "text",
        true
    )
}

function removeMarker(clientId){
    const marker = clientMarkers.get(clientId)
    editor.session.removeMarker(marker.id)

    clientMarkers.delete(clientId)
}


// Connection form
class Form {
    constructor(){
        this.form = document.createElement("form")
        const startingText = `
            <div style="margin-bottom:10px">
            <label>Username:</label><br>
            <input name="username" placeholder="guest" style="width:100%" />
            </div>
            <div style="margin-bottom:10px">
            <!--
            <label>Server URL:</label><br>
            <input name="serverURL" style="width:100%" />
            </div>
            -->
            <div style="margin-bottom:10px">
            <label>Document Name:</label><br>
            <input name="documentName" placeholder="main" style="width:100%" />
            </div>
            <button type="submit">Submit</button>
            <button type="button" id="cancelBtn">Cancel</button>
        `
        this.setInnerHTML(startingText)
        this.createFormbox()
        this.createOverlay()
    }

    createFormbox(){
        this.formBox = document.createElement("div")
        this.formBox.style.background = "white"
        this.formBox.style.padding = "20px"
        this.formBox.style.borderRadius = "8px"
        this.formBox.style.minWidth = "300px"
        this.formBox.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"
    }

    createOverlay(){
        this.overlay = document.createElement("div")
        this.overlay.style.position = "fixed"
        this.overlay.style.top = "0"
        this.overlay.style.left = "0"
        this.overlay.style.width = "100vw"
        this.overlay.style.height = "100vh"
        this.overlay.style.background = "rgba(0,0,0,0.5)"
        this.overlay.style.display = "flex"
        this.overlay.style.alignItems = "center"
        this.overlay.style.justifyContent = "center"
        this.overlay.style.zIndex = "9999"

    }

    setInnerHTML(text){
        this.form.innerHTML = text
    }

    close(){
        document.removeEventListener("keydown", e => this.onKey(e))
        if (this.overlay.parentNode) {
            document.body.removeChild(this.overlay)
        }
    }

    show(){
        document.addEventListener("keydown", e => this.onKey(e))

        this.form.addEventListener("submit", e => {
            e.preventDefault()

            const data = new FormData(this.form)

            this.close()

            client.setCredentials({
                clientId: data.get("username"),
                // serverURL: data.get("serverURL"),
                docId: data.get("documentName")
            })

            client.connect()

            joinButton.style.display = "none"
            disconnectButton.style.display = "block"
        })

        this.form.querySelector("#cancelBtn").addEventListener("click", () => this.close())
        this.formBox.appendChild(this.form)
        this.overlay.appendChild(this.formBox)
        document.body.appendChild(this.overlay)
    }

    onKey(e) {
        if (e.key === "Escape") {
            this.close()
        }
    }

}

function createConnectButton() {
    const btn = document.createElement("button")
    btn.textContent = "Join"
    btn.style.position = "fixed"
    btn.style.top = "4px"
    btn.style.right = "120px"
    btn.style.zIndex = "9999"
    btn.style.padding = "4px 8px"
    btn.style.borderRadius = "6px"
    btn.style.border = "none"
    btn.style.background = "#21a113"
    btn.style.color = "white"
    btn.style.cursor = "pointer"
    btn.style.boxShadow = "0 2px 10px rgba(0,0,0,0.7)"
    btn.style.fontSize = "12px"
    btn.style.display = "block"

    return btn
}

function createDisconnectButton() {
    const btn = document.createElement("button")
    btn.textContent = "Disconnect"
    btn.style.position = "fixed"
    btn.style.top = "4px"
    btn.style.right = "120px"
    btn.style.zIndex = "9998"
    btn.style.padding = "4px 8px"
    btn.style.borderRadius = "6px"
    btn.style.border = "none"
    btn.style.background = "#007bff"
    btn.style.color = "white"
    btn.style.cursor = "pointer"
    btn.style.boxShadow = "0 2px 10px rgba(0,0,0,0.7)"
    btn.style.fontSize = "12px"
    btn.style.display = "none"

    return btn
}

const form = new Form()
// form.show()
const joinButton = createConnectButton()
joinButton.addEventListener("click", () => {
    form.show()
})
document.body.appendChild(joinButton)

const disconnectButton = createDisconnectButton()
disconnectButton.addEventListener("click", () => {
    client.disconnect()
    joinButton.style.display = "block"
    disconnectButton.style.display = "none"
})
document.body.appendChild(disconnectButton)
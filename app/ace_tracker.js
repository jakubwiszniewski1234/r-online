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

// Get server URL from user
let inputServerElement = document.createElement("textarea")
inputServerElement.style.padding = '30px'
inputServerElement.style.border = '20px solid black'
inputServerElement.style.backgroundColor = 'rgba(132, 255, 164, 1)'
inputServerElement.value = "TEST"
inputServerElement.style.zIndex = "100000"
inputServerElement.style.position = "absolute"
editor.container.appendChild(inputServerElement)

var serverURL
var ws_temp
inputServerElement.addEventListener("change", () => {
    serverURL = inputServerElement.value
    console.log(serverURL)
    try{
        const ws = new WebSocket(serverURL)
        // its an event listener so later code will compute anyway
    } catch (e) {
        console.log(e.name, e.message)
    }
})

editor.container.appendChild(inputServerElement)

const ws = new WebSocket('https://crdt-server.onrender.com');


const clientId = crypto.randomUUID();
let revision = 0;
let applyingRemote = false;

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'hello',
        docId: 'main',
        clientId
    }));
};


let pendingDeltas = []
let debounceTimer

editor.session.on('change', delta => {
    if (applyingRemote) return

    pendingDeltas.push(delta)
    
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        console.log(pendingDeltas)
        ws.send(JSON.stringify({
            type: 'delta',
            docId: 'main',
            clientId,
            opId: crypto.randomUUID(),
            baseRevision: revision,
            delta: pendingDeltas
        }))

        pendingDeltas = []
    }, 30)
})

ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);

    if (msg.type === 'snapshot') {
        applyingRemote = true;
        editor.setValue(msg.text, -1);
        revision = msg.revision;
        applyingRemote = false;
        return;
    }

    if (msg.type === 'delta') {
        if (msg.sourceClientId === clientId) {
            revision = msg.revision;
            return;
        }

        console.log(msg.delta)

        applyingRemote = true;
        editor.session.getDocument().applyDeltas(msg.delta);
        revision = msg.revision;
        applyingRemote = false;
    }
};

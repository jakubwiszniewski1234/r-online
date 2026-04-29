const el = document.getElementById("rstudio_source_text_editor")
const editor = ace.edit(el)
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
    }, 250)
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
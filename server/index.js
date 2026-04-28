import { WebSocketServer } from 'ws';

// Server deployment

const PORT = process.env.PORT || 3000
const wss = new WebSocketServer({
    port: PORT
})



// Shared document

const docs = new Map();

function getDoc(docId) {
  if (!docs.has(docId)) {
    docs.set(docId, {
      text: '',
      revision: 0,
      history: []
    });
  }
  return docs.get(docId);
}

// Changes to text transformation

function posToIndex(text, pos) {
  const lines = text.split('\n');
  let idx = 0;
  for (let i = 0; i < pos.row; i++) idx += lines[i].length + 1;
  return idx + pos.column;
}

function applyDeltaToText(text, delta) {
  const start = posToIndex(text, delta.start);
  const end = posToIndex(text, delta.end);

  if (delta.action === 'insert') {
    const inserted = delta.lines.join('\n');
    return text.slice(0, start) + inserted + text.slice(start);
  }

  return text.slice(0, start) + text.slice(end);
}

function deltaToRangeLen(delta, text) {
  const start = posToIndex(text, delta.start);
  const end = posToIndex(text, delta.end);
  return { start, end, len: end - start };
}

function transformIndexInsert(index, insertPos, insertLen) {
  return index >= insertPos ? index + insertLen : index;
}

function transformIndexDelete(index, delStart, delEnd) {
  if (index <= delStart) return index;
  if (index >= delEnd) return index - (delEnd - delStart);
  return delStart;
}

function transformDelta(delta, applied, textBeforeApplied) {
  const s = posToIndex(textBeforeApplied, delta.start);
  const e = posToIndex(textBeforeApplied, delta.end);
  const aStart = posToIndex(textBeforeApplied, applied.start);
  const aEnd = posToIndex(textBeforeApplied, applied.end);

  if (applied.action === 'insert') {
    const insLen = applied.lines.join('\n').length;
    return {
      ...delta,
      start: { ...delta.start, column: transformIndexInsert(s, aStart, insLen) },
      end: { ...delta.end, column: transformIndexInsert(e, aStart, insLen) }
    };
  }

  if (applied.action === 'remove') {
    return {
      ...delta,
      start: { ...delta.start, column: transformIndexDelete(s, aStart, aEnd) },
      end: { ...delta.end, column: transformIndexDelete(e, aStart, aEnd) }
    };
  }

  return delta;
}



// Server responses

wss.on('connection', ws => {
  ws.on('message', raw => {
    const msg = JSON.parse(raw.toString());

    // Handshake
    if (msg.type === 'hello') {
      const doc = getDoc(msg.docId);
      ws.docId = msg.docId;
      ws.clientId = msg.clientId;

      console.log(`Recieved a "hello" message from ${ws.clientId} on file ${ws.docId}.`)

      ws.send(JSON.stringify({
        type: 'snapshot',
        docId: msg.docId,
        text: doc.text,
        revision: doc.revision
      }));
      return;
    }

    
    // Ignore unrelated queries
    if (msg.type !== 'delta') {
        console.log(`Got a weird message of type ${msg.type}.`)
    }


    // New changes query
    const doc = getDoc(msg.docId);
    if (!ws.docId) ws.docId = msg.docId;

    if (msg.baseRevision < doc.revision) {
      let transformed = msg.delta;
      for (let i = msg.baseRevision; i < doc.history.length; i++) {
        const applied = doc.history[i];
        transformed = transformDelta(transformed, applied.delta, doc.text);
      }
      msg.delta = transformed;
      msg.baseRevision = doc.revision;
    }

    doc.text = applyDeltaToText(doc.text, msg.delta);
    doc.revision += 1;
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
      if (client.readyState === 1) client.send(out);
    }
  });
});

console.log(`WS server running on port ${PORT}.`);
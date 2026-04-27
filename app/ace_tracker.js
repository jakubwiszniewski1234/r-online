// (function () {

//   const BRIDGE_URL = "http://localhost:4000"

//   function waitForEditor() {
//     return new Promise(resolve => {
//       const t = setInterval(() => {

//         const el = document.getElementById("rstudio_source_text_editor_1")
//         if (!el || !window.ace) return

//         const editor = ace.edit(el)
//         clearInterval(t)
//         resolve(editor)

//       }, 200)
//     })
//   }

//   waitForEditor().then(editor => {

//     let isRemote = false

//     // 🔥 debounce buffer
//     let queue = []
//     let timer = null

//     function flush() {
//       if (queue.length === 0) return

//       fetch(`${BRIDGE_URL}/ace-delta`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           deltas: queue
//         })
//       })

//       queue = []
//     }

//     editor.session.on('change', (delta) => {
//       if (isRemote) return

//       queue.push(delta)

//       if (timer) clearTimeout(timer)

//       timer = setTimeout(() => {
//         flush()
//       }, 30) // batching window
//     })

//   })

// })()

(function () {

  const BRIDGE_URL = "http://localhost:4000"
  const WS_URL = "ws://localhost:4001"
  const CLIENT_ID = Math.random().toString(36).slice(2)

  function waitForEditor() {
    return new Promise(resolve => {
      const t = setInterval(() => {

        const el = document.getElementById("rstudio_source_text_editor_0")
        if (!el || !window.ace) return

        const editor = ace.edit(el)
        clearInterval(t)
        resolve(editor)

      }, 200)
    })
  }

  waitForEditor().then(editor => {

    let isRemote = false

    // --- WS connection ---
    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      console.log("[ACE] WS connected")
    }

    ws.onmessage = (event) => {

      const msg = JSON.parse(event.data)
      console.log(msg.source)

      if (msg.type === "full_text") {

        if (msg.source === CLIENT_ID) {
          return
        }

        isRemote = true
        const cursor = editor.getCursorPosition()
        editor.setValue(msg.text, -1)
        editor.moveCursorTo(cursor.row, cursor.column)
        isRemote = false
      }
      
      if (msg.type === "partial") {

        if (msg.source === CLIENT_ID) {
          return
        }

        console.log(msg.aceDeltas)
        isRemote = true
        msg.aceDeltas.forEach(d => editor.session.getDocument().applyDelta(d))
        isRemote = false

        // insert text (using ace deltas)

        // isRemote = true
        // const cursor = editor.getCursorPosition()
        // editor.setValue(msg.text, -1)
        // editor.moveCursorTo(cursor.row, cursor.column)
        // isRemote = false
      }
    }

    ws.onclose = () => {
      console.log("[ACE] WS closed")
    }

    // --- debounce buffer ---
    let queue = []
    let timer = null

    function flush() {
      if (queue.length === 0) return

      fetch(`${BRIDGE_URL}/ace-delta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          clientId: CLIENT_ID,
          deltas: queue
        })
      })
      console.log("queue:", queue)
      queue = []
    }

    editor.session.on('change', (delta) => {
      if (isRemote) return

      queue.push(delta)

      if (timer) clearTimeout(timer)

      timer = setTimeout(() => {
        flush()
      }, 20)
    })

  })

})()
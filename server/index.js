const WebSocket = require('ws')

const port = process.env.PORT || 3000

const server = new WebSocket.Server({ port })

console.log(`Server running on port ${port}`)

server.on('connection', socket => {
    socket.on('message', message => {
        console.log(message.toString())
        socket.send(message.toString())
    })
})
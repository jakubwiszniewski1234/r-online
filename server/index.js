const ws = require('ws')

const server = new ws.Server({port: '80'})

console.log("Server launched and ready to listen")

server.on('connection', socket => {
    socket.on('message', message => {
        console.log(message)
        socket.send(`${message}`)
    })
})
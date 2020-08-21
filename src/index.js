//serving all modules
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message.js')
const {addUser, removedUser, getUser, getUserInRoom} = require('./utils/users')
const { urlencoded } = require('express')
 
//erving servers and ports
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
//serving path
const publicDirectoryPath = path.join(__dirname, '../public')
//serving up static files
app.use(express.static(publicDirectoryPath))

//serving up io connection
let count = 0
io.on('connection', (socket) => {
    console.log('connection active')
    
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()

    })

    socket.on('sendMessage', (newMessage, callback) => {
        const filter = new Filter()

        if(filter.isProfane(newMessage)){
            return callback('Profamity words not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, newMessage))
        callback('Message delivered')
    })
    
    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, latitude, longitude))
        callback('Location shared')
    })
    
    socket.on('disconnect', () => {
        console.log('connection lost')
        const user = removedUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.rppm,
                users: getUserInRoom(user.room)
            })
        }
    })
})



// listening to server
server.listen(port, () => {
    console.log('Your server is running on port ' + port)
})
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const User = require('./user')
const Game = require('./game')

const port = process.env.PORT || 3000
const debug = process.env.DEBUG || true

const CHAT_MESSAGE = 'chat-message'
const ERROR_MESSAGE = 'error-message'
const INIT_USER = 'init-user'
const CMD = 'cmd'
const GENERAL_ROOM = 'generalRoom'

const users = {}
const games = {}

function generate() {
  return (new Date()).getTime().toString(36)
}

function changeRoom(socket, roomId) {
  socket.leave(GENERAL_ROOM)
  socket.join(roomId)
  const { name } = users[socket.id]
  delete users[socket.id]
  users[socket.id] = User(name, roomId, socket.id)
  socket.emit(CHAT_MESSAGE, `I will move you on the new room ${roomId}...`)
  return users[socket.id]
}

function addPlayerToGame(player, id) {
  games[id].addPlayer(player)
}

function createGame(owner, id) {
  games[id] = Game(owner, id)
  addPlayerToGame(owner, id)
}

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})

io.on('connection', (socket) => {
  let currentUser

  socket.on(INIT_USER, (name) => {
    socket.join(GENERAL_ROOM)
    users[socket.id] = User(name, GENERAL_ROOM, socket.id)
    currentUser = users[socket.id]
  })

  socket.on(CHAT_MESSAGE, (msg) => {
    io.to(currentUser.room).emit(CHAT_MESSAGE, `${currentUser.name}: ${msg}`)
  })

  socket.on(CMD, (command) => {
    const commandLine = command.split(' ')
    const exec = commandLine[0]

    if (exec === '!create') {
      // TODO: disallow people from creating another game if already in one
      // TODO: disallow to start if less than 2 players
      const roomId = generate()
      currentUser = changeRoom(socket, roomId)
      createGame(currentUser, roomId)
    }

    if (exec === '!join') {
      // TODO: disallow people from joining if game has started
      // TODO: disallow people from joining another game if already in one
      const roomId = commandLine[1]
      currentUser = changeRoom(socket, roomId)
      addPlayerToGame(currentUser, roomId)
    }

    if (exec === '!start') {
      const result = games[currentUser.room].bootstrapGame(currentUser, io)
      if (!result) {
        socket.emit(ERROR_MESSAGE, 'You cannot start a game that you did not create')
      }
    }

    if (exec === '!raise') {
      const amount = parseInt(commandLine[1], 10)
      const currentGame = games[currentUser.room]
      currentGame.raise(amount, currentUser, io)
    }

    if (exec === '!call') {
      const currentGame = games[currentUser.room]
      currentGame.call(currentUser, io)
    }

    if (exec === '!fold') {
      const currentGame = games[currentUser.room]
      if (currentGame.isPlayerInTurn(currentUser)) {
        currentGame.fold(currentUser, io)
      } else {
        socket.emit(ERROR_MESSAGE, 'You cannot !fold because it\'s not your turn')
      }
    }

    if (debug && exec === '!debug') {
      const currentRoom = Object.keys(socket.rooms)[0]
      socket.emit(CHAT_MESSAGE, `currentRoom: ${JSON.stringify(currentRoom)}`)
      socket.emit(CHAT_MESSAGE, `games: ${JSON.stringify(games)}`)
      socket.emit(CHAT_MESSAGE, `users: ${JSON.stringify(users)}`)
      socket.emit(CHAT_MESSAGE, `whomai: ${socket.id}`)
    }
  })
})

http.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on *: ${port}`)
  // eslint-disable-next-line no-console
  console.log(`debug is ${debug}`)
})

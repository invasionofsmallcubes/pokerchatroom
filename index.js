const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const User = require('./user')
const Game = require('./game')
const Chat = require('./chat')
const PokerDeck = require('./pokerDeck')
const WinnerCalculator = require('./winnerCalculator')

const port = process.env.PORT || 3000
const debug = process.env.DEBUG || true

const CHAT_MESSAGE = 'chat-message'
const INIT_USER = 'init-user'
const CMD = 'cmd'
const GENERAL_ROOM = 'generalRoom'

const users = {}
const games = {}

function generate() {
  return new Date().getTime().toString(36)
}

function changeRoom(socket, roomId, chat) {
  socket.leave(GENERAL_ROOM)
  socket.join(roomId)
  const { name } = users[socket.id]
  delete users[socket.id]
  users[socket.id] = User(name, roomId, socket.id)
  chat.toSelf(socket.id, `I will move you on the new room ${roomId}...`)
  return users[socket.id]
}

function addPlayerToGame(player, id) {
  games[id].addPlayer(player)
}

function createGame(owner, id) {
  games[id] = Game(owner, id, PokerDeck(), WinnerCalculator())
  addPlayerToGame(owner, id)
}

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`)
})

io.on('connection', (socket) => {
  const chat = Chat(io, socket)
  let currentUser

  socket.on(INIT_USER, (name) => {
    socket.join(GENERAL_ROOM)
    users[socket.id] = User(name, GENERAL_ROOM, socket.id)
    currentUser = users[socket.id]
  })

  socket.on(CHAT_MESSAGE, (msg) => {
    chat.room(currentUser.room, `${currentUser.name}: ${msg}`)
  })

  socket.on(CMD, (command) => {
    const commandLine = command.split(' ')
    const exec = commandLine[0]

    if (exec === '!create') {
      // TODO: disallow people from creating another game if already in one
      // TODO: disallow to start if less than 2 players
      const roomId = generate()
      currentUser = changeRoom(socket, roomId, chat)
      createGame(currentUser, roomId)
    }

    if (exec === '!join') {
      // TODO: disallow people from joining if game has started
      // TODO: disallow people from joining another game if already in one
      const roomId = commandLine[1]
      currentUser = changeRoom(socket, roomId, chat)
      addPlayerToGame(currentUser, roomId)
    }

    if (exec === '!start') {
      const state = games[currentUser.room].bootstrapGame(currentUser)
      state.print(chat)
    }

    if (exec === '!raise') {
      const amount = parseInt(commandLine[1], 10)
      const currentGame = games[currentUser.room]
      const state = currentGame.raise(amount, currentUser, chat)
      state.print(chat)
    }

    if (exec === '!call') {
      const currentGame = games[currentUser.room]
      const state = currentGame.call(currentUser, chat)
      state.print(chat)
    }

    if (exec === '!fold') {
      const currentGame = games[currentUser.room]
      const state = currentGame.fold(currentUser)
      state.print(chat)
    }

    if (debug && exec === '!debug') {
      const currentRoom = Object.keys(socket.rooms)[0]
      chat.toSelf(socket.id, `currentRoom: ${JSON.stringify(currentRoom)}`)
      chat.toSelf(socket.id, `games: ${JSON.stringify(games)}`)
      chat.toSelf(socket.id, `users: ${JSON.stringify(users)}`)
      chat.toSelf(socket.id, `whomai: ${socket.id}`)
    }
  })
})

http.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on *: ${port}`)
  // eslint-disable-next-line no-console
  console.log(`debug is ${debug}`)
})

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const cron = require('node-cron')
const User = require('./user')
const Game = require('./game')
const Chat = require('./chat')
const PokerDeck = require('./pokerDeck')
const WinnerCalculator = require('./winnerCalculator')
const tp = require('./timePassed')
const ErrorState = require('./errorState')

const port = process.env.PORT || 3000
const debug = process.env.DEBUG || true

const CHAT_MESSAGE = 'chat-message'
const INIT_USER = 'init-user'
const CMD = 'cmd'
const GENERAL_ROOM = 'generalRoom'
const CHAT_UPDATE_ROOM = 'chat-update-room'

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
  chat.toSelf(
    socket.id,
    `I will move you on the new room ${roomId} (pass this code to your friends)`
  )
  chat.toSelfInTopic(socket.id, roomId, CHAT_UPDATE_ROOM)
  return users[socket.id]
}

function addPlayerToGame(player, id) {
  return games[id].addPlayer(player)
}

function createGame(owner, id) {
  games[id] = Game(
    owner,
    id,
    PokerDeck(),
    WinnerCalculator(),
    tp.TimePassed(Math.floor(Date.now() / 1000))
  )
  return addPlayerToGame(owner, id)
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
    chat.room(currentUser.room, { name: currentUser.name, msg })
  })

  socket.on(CMD, (command) => {
    const commandLine = command.split(' ')
    const exec = commandLine[0]
    try {
      if (exec === '!create') {
        // TODO: disallow people from creating another game if already in one
        // TODO: disallow to start if less than 2 players
        const roomId = generate()
        currentUser = changeRoom(socket, roomId, chat)
        const state = createGame(currentUser, roomId, chat)
        state.print(chat)
      }

      if (exec === '!join') {
        // TODO: disallow people from joining if game has started
        // TODO: disallow people from joining another game if already in one
        const roomId = commandLine[1]
        currentUser = changeRoom(socket, roomId, chat)
        const state = addPlayerToGame(currentUser, roomId)
        state.print(chat)
      }

      if (exec === '!next') {
        const currentGame = games[currentUser.room]
        const state = currentGame.nextTurn(currentUser)
        state.print(chat)
      }

      if (exec === '!start') {
        const state = games[currentUser.room].bootstrapGame(currentUser)
        state.print(chat)
        cron.schedule('*/12 * * * *', () => {
          games[currentUser.room].elapsedTime().print(chat)
        })
      }

      if (exec === '!raise') {
        const amount = parseInt(commandLine[1], 10)
        if (Number.isNaN(amount)) {
          ErrorState(socket.id, `${amount} is not a number`).print(chat)
        } else {
          const currentGame = games[currentUser.room]
          const state = currentGame.raise(amount, currentUser, chat)
          state.print(chat)
        }
      }

      if (exec === '!updatebb') {
        const smallBlind = parseInt(commandLine[1], 10)
        const bigBlind = parseInt(commandLine[2], 10)
        const currentGame = games[currentUser.room]
        const state = currentGame.updateBlinds(smallBlind, bigBlind, currentUser)
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
    } catch (error) {
      chat.toSelf(socket.id, `You did something wrong! error is ${error}`)
    }
  })
})

http.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on *: ${port}`)
  // eslint-disable-next-line no-console
  console.log(`debug is ${debug}`)
})

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const port = process.env.PORT || 3000
const debug = process.env.DEBUG || true


const CHAT_MESSAGE = 'chat-message'
const PERSONAL_MESSAGE = 'personal-message'
const GAME_MESSAGE = 'game-message'
const ERROR_MESSAGE = 'error-message'
const INIT_USER = 'init-user'
const CMD = 'cmd'
const GENERAL_ROOM = 'generalRoom'

const users = {}
const games = {}

function User(name, room, id) {
  return {
    name,
    room,
    id,
  }
}

function Player(user, money) {
  return {
    user,
    money,
    hasFolded: false,
  }
}

function Game(owner, id) {
  return {
    owner,
    id,
    players: [],
    hasNotStartedYet: true,
    dealer: undefined,
    round: undefined,
    smallBlind: 5,
    bigBlind: 10,
    playerSize: 0,
    highestBet: 0,
    deck: {
      drawTwoCards() {
        return ['1', '2']
      },
      drawThreeCards() {
        return ['3', '4', '5']
      },
      drawOneCard() {
        return ['6']
      },
    },
    addPlayer(user) {
      if (this.hasNotStartedYet) {
        this.players.push(Player(user, 100))
        this.playerSize += 1
      }
      return this.hasNotStartedYet
    },
    raise(amount, user, comms) {
      comms.to(user.id).emit(ERROR_MESSAGE, `not supported command !raise ${amount}`)
    },
    call(user, comms) {
      comms.to(user.id).emit(ERROR_MESSAGE, 'not supported command !call')
    },
    fold(user, comms) {
      comms.to(user.id).emit(ERROR_MESSAGE, 'not supported command !fold')
      const currentPlayer = this.players.filter((p) => p.user.id === user.id)[0]
      currentPlayer.hasFolded = true
      this.waitingPlayer += 1
      comms.to(this.id).emit(GAME_MESSAGE, `Player ${user.name} has folded`)
      comms.to(this.id).emit(GAME_MESSAGE, `Waiting for move from ${this.players[this.waitingPlayer].user.name}`)
    },
    bootstrapGame(userAsking, comms) {
      if (this.owner === userAsking) {
        this.hasNotStartedYet = false
        comms.to(this.id).emit(GAME_MESSAGE, `Game in room ${this.id} has started by ${owner.name}`)
        this.round = 0
        const l = this.players.length
        this.dealer = this.round % l
        const smallBlind = (this.dealer + 1) % l
        const bigBlind = (this.dealer + 2) % l
        this.players[(this.dealer + 1) % l].money -= this.smallBlind
        this.players[(this.dealer + 2) % l].money -= this.bigBlind
        this.plate = this.bigBlind + this.smallBlind
        this.waitingPlayer = (this.dealer + 3) % l
        this.highestBet = this.bigBlind
        comms.to(this.id).emit(GAME_MESSAGE, `The dealer is ${this.players[this.dealer].user.name}`)
        comms.to(this.id).emit(GAME_MESSAGE, `The small blind is ${this.players[smallBlind].user.name}`)
        comms.to(this.id).emit(GAME_MESSAGE, `The big blind is ${this.players[bigBlind].user.name}`)
        comms.to(this.id).emit(GAME_MESSAGE, `Current pool prize is: ${this.plate}`)
        comms.to(this.id).emit(GAME_MESSAGE, 'Dealing cards...')

        for (let i = 0; i < this.playerSize; i += 1) {
          const handPlayer = this.players[(this.dealer + i) % this.playerSize]
          handPlayer.hand = this.deck.drawTwoCards()
          comms.to(handPlayer.user.id).emit(PERSONAL_MESSAGE, `Your hand is ${handPlayer.hand[0]} and ${handPlayer.hand[1]}`)
        }

        comms.to(this.id).emit(GAME_MESSAGE, `Waiting for move from ${this.players[this.waitingPlayer].user.name}`)
        return true
      }
      return false
    },
  }
}

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
      currentGame.fold(currentUser, io)
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

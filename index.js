var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

const CHAT_MESSAGE = 'chat-message';
const ERROR_MESSAGE = 'error-message';
const INIT_USER = 'init-user';
const CMD = 'cmd';
const GENERAL_ROOM = 'generalRoom';

const users = {};
const games = {};

function User(name, room) {
  return {
    name: name,
    room: room
  }
}

function Game(owner, id) {
  return {
    owner: owner,
    id: id,
    players: [],
    hasNotStartedYet: true,
    addPlayer: function (player) {
      if (this.hasNotStartedYet) {
        this.players.push(player)
      }
      return this.hasNotStartedYet
    },
    startGame: function (userAsking) {
      if (this.owner === userAsking) {
        this.hasNotStartedYet = false;
        return true;
      } else {
        return false;
      }
    }
  }
}

function generate() {
  return (new Date()).getTime().toString(36)
}

function changeRoom(socket, roomId) {
  socket.leaveAll();
  socket.join(roomId);
  const name = users[socket.id].name
  delete users[socket.id]
  users[socket.id] = User(name, roomId)
  socket.emit(CHAT_MESSAGE, 'I will move you on the new room ' + roomId + '...');
}

function addPlayerToGame(player, id) {
  games[id].addPlayer(player);
}

function createGame(owner, id) {
  games[id] = Game(owner, id)
  addPlayerToGame(owner, id)
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

  socket.on(INIT_USER, function (name) {
    socket.join(GENERAL_ROOM);
    users[socket.id] = User(name, GENERAL_ROOM)
  });

  socket.on(CHAT_MESSAGE, function (msg) {
    io.to(users[socket.id].room).emit(CHAT_MESSAGE, users[socket.id].name + ': ' + msg);
  });

  socket.on(CMD, function (command) {
    commandLine = command.split(' ');
    const exec = commandLine[0]

    if (exec === '!create') {
      const roomId = generate();
      changeRoom(socket, roomId);
      createGame(users[socket.id], roomId);
    }

    if (exec === '!join') {
      // TODO: disallow people from joining if game has started
      const roomId = commandLine[1];
      changeRoom(socket, roomId);
      addPlayerToGame(users[socket.id], roomId);
    }

    if (exec == '!start') {
      const userAsking = users[socket.id]
      const result = games[userAsking.room].startGame(userAsking);
      if (result) {
        io.to(userAsking.room).emit(CHAT_MESSAGE, `Game in room ${userAsking.room} has started by ${userAsking.name}`)
      } else {
        socket.emit(ERROR_MESSAGE, 'You cannot start a game that you did not create')
      }
    }

    if (exec === '!debug') {
      const currentRoom = Object.keys(socket.rooms)[0]
      socket.emit(CHAT_MESSAGE, 'games: ' + JSON.stringify(games))
      socket.emit(CHAT_MESSAGE, 'users: ' + JSON.stringify(users))
    }
  });

});

http.listen(port, function () {
  console.log('listening on *:' + port);
});

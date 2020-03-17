var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

const CHAT_MESSAGE = 'chat-message';
const INIT_USER = 'init-user';
const CMD = 'cmd';
const GENERAL_ROOM = 'generalRoom';

const users = {};

function User(name, room) {
  return {
    name: name,
    room: room
  }
}

function generate() {
  return (new Date()).getTime().toString(36)
}

function changeRoom(socket, roomId) {
  socket.leaveAll();
  socket.join(roomId);
  delete users[socket.id]
  users[socket.id] = User(roomId)
  socket.emit(CHAT_MESSAGE, 'I will move you on the new room ' + roomId + '...');
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  socket.on(INIT_USER, function(name) {
    console.log(INIT_USER);
    socket.join(GENERAL_ROOM);
    users[socket.id] = User(name, GENERAL_ROOM)
  });

  socket.on(CHAT_MESSAGE, function(msg){
    console.log(CHAT_MESSAGE);
    io.to(users[socket.id].room).emit(CHAT_MESSAGE, users[socket.id].name + ': ' + msg);
  });

  socket.on(CMD, function(command){
    console.log(CHAT_MESSACMDGE);

    commandLine = command.split(' ');

    if(commandLine[0] === '!create') {
        const roomId = generate();
        changeRoom(socket, roomId);
    }

    if(commandLine[0] === '!join') {
      changeRoom(socket, commandLine[1]);
    }
  });

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

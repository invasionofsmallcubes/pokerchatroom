const GAME_MESSAGE = 'game-message'
const CHAT_MESSAGE_SELF = 'chat-message-self'
const ERROR_MESSAGE = 'error-message'
const PERSONAL_MESSAGE = 'personal-message'
const CHAT_MESSAGE = 'chat-message'

function Chat(io, socket) {
  return {
    comms: io,
    commsSelf: socket,
    error(id, message) {
      this.comms.to(id).emit(ERROR_MESSAGE, message)
    },
    room(roomName, message) {
      this.comms.to(this.commsSelf.id).emit(CHAT_MESSAGE_SELF, message)
      this.commsSelf.to(roomName).emit(CHAT_MESSAGE, message)
    },
    game(roomName, message) {
      this.comms.to(roomName).emit(GAME_MESSAGE, message)
    },
    toSelf(id, message) {
      this.comms.to(id).emit(PERSONAL_MESSAGE, message)
    },
  }
}
module.exports = Chat

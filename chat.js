const GAME_MESSAGE = 'game-message'
const ERROR_MESSAGE = 'error-message'
const PERSONAL_MESSAGE = 'personal-message'
const CHAT_MESSAGE = 'chat-message'

function Chat(io) {
  return {
    comms: io,
    error(id, message) {
      this.comms.to(id).emit(ERROR_MESSAGE, message)
    },
    room(roomName, message) {
      this.comms.to(roomName).emit(CHAT_MESSAGE, message)
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

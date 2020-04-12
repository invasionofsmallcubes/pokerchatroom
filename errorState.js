function ErrorState(room, message) {
  return {
    room,
    message,
    print(chat) {
      chat.error(this.room, message)
    },
  }
}

module.exports = ErrorState

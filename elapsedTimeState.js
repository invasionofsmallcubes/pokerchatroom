function ElapsedTimeState(room, message) {
  return {
    room,
    message,
    print(chat) {
      chat.game(this.room, `Elapsed Time: ${this.message}`)
    },
  }
}

module.exports = ElapsedTimeState

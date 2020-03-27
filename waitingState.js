function WaitingState(room, nextPlayerName) {
  return {
    room,
    nextPlayerName,
    print(chat) {
      chat.game(this.room, `Waiting for move from ${this.nextPlayerName}`)
    }
  }
}

module.exports = WaitingState

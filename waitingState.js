function WaitingState(room, nextPlayerName, selfId) {
  return {
    room,
    nextPlayerName,
    selfId,
    print(chat) {
      chat.game(this.room, `Waiting for move from ${this.nextPlayerName}`)
      chat.toSelf(selfId, "It's your turn!")
    },
  }
}

module.exports = WaitingState

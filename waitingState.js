function WaitingState(room, nextPlayerName, selfId) {
  return {
    room,
    nextPlayerName,
    selfId,
    print(chat) {
      chat.gameExceptSender(this.room, `Waiting for move from ${this.nextPlayerName}`)
      chat.toSelf(selfId, "It's your turn!")
    },
  }
}

module.exports = WaitingState

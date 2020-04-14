function BlindUpdatedState(room, smallBlind, bigBlind) {
  return {
    room,
    smallBlind,
    bigBlind,
    print(chat) {
      chat.game(
        this.room,
        `Blinds updated: Small Blind is ${this.smallBlind}, Big Blind is ${this.bigBlind}`
      )
    },
  }
}

module.exports = BlindUpdatedState

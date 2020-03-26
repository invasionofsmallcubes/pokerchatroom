function FoldState(foldingPlayerName, room, nextPlayerName) {
  return {
    foldingPlayerName,
    room,
    nextPlayerName,
    print(chat) {
      chat.game(this.room, `Player ${this.foldingPlayerName} has folded`)
      chat.game(
        this.room,
        `Waiting for move from ${this.nextPlayerName}`
      )
    }
  }
}
module.exports = FoldState

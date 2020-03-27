function FoldState(foldingPlayerName, room, nextPlayerName) {
  return {
    foldingPlayerName,
    room,
    nextPlayerName,
    print(chat) {
      chat.game(this.room, `Player ${this.foldingPlayerName} has folded`)
      nextPlayerName.print(chat)
    }
  }
}
module.exports = FoldState

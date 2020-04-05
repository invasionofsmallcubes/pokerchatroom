function FoldState(foldingPlayerName, room, nextState) {
  return {
    foldingPlayerName,
    room,
    nextState,
    print(chat) {
      chat.game(this.room, `Player ${this.foldingPlayerName} has folded`)
      nextState.print(chat)
    },
  }
}
module.exports = FoldState

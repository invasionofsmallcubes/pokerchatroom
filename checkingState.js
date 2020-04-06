function CheckingState(checkingPlayer, room, nextState) {
  return {
    checkingPlayer,
    room,
    nextState,
    print(chat) {
      chat.game(this.room, `Player ${this.checkingPlayer} has checked`)
      nextState.print(chat)
    },
  }
}

module.exports = CheckingState

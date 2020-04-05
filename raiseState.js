function RaiseState(bettingPlayerName, room, amount, nextState) {
  return {
    bettingPlayerName,
    room,
    nextState,
    amount,
    print(chat) {
      chat.game(
        this.room,
        `Player ${this.bettingPlayerName} raise to ${this.amount}`
      )
      nextState.print(chat)
    },
  }
}
module.exports = RaiseState

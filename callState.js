function CallState(callingPlayer, room, nextState, amount, poolPrize) {
  return {
    callingPlayer,
    room,
    nextState,
    amount,
    poolPrize,
    print(chat) {
      chat.game(
        this.room,
        `Player ${this.callingPlayer} has called (${this.amount})`
      )
      chat.game(this.room, `The pool prize is ${this.poolPrize}`)
      nextState.print(chat)
    },
  }
}

module.exports = CallState

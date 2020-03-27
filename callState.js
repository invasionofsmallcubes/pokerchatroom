function CallState(callingPlayer, room, nextPlayerName, amount, poolPrize) {
  return {
    callingPlayer,
    room,
    nextPlayerName,
    amount,
    poolPrize,
    print(chat) {
      chat.game(this.room, `Player ${this.callingPlayer} has called (${this.amount})`)
      chat.game(this.room, `The pool prize is ${this.poolPrize}`)
      nextPlayerName.print(chat)
    }
  }
}

module.exports = CallState

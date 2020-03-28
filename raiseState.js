function RaiseState(bettingPlayerName, room, amount, nextPlayerName) {
  return {
    bettingPlayerName,
    room,
    nextPlayerName,
    amount,
    print(chat) {
      chat.game(this.room, `Player ${this.bettingPlayerName} raise to ${this.amount}`)
      nextPlayerName.print(chat)
    }
  }
}
module.exports = RaiseState

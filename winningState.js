function WinningState(winnerPlayer, money, room) {
  return {
    winnerPlayer,
    room,
    money,
    print(chat) {
      chat.game(this.room, `Player ${this.winnerPlayer} wins ${this.money}!`)
    },
  }
}

module.exports = WinningState

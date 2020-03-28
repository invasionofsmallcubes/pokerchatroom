function WinningState(winnerPlayer, room) {
  return {
    winnerPlayer,
    room,
    print(chat) {
      chat.game(this.room, `Player ${this.winnerPlayer} wins!`)
    }
  }
}

module.exports = WinningState

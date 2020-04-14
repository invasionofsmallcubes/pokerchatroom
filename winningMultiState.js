function WinningMultiState(winnerPlayers, room) {
  return {
    winnerPlayers,
    room,
    print(chat) {
      for (let i = 0; i < winnerPlayers.length; i += 1) {
        const p = this.winnerPlayers[i]
        chat.game(this.room, `Player ${p.user.name} wins ${p.money}!`)
        chat.toSelfInTopic(p.user.id, { money: p.money.toString() }, 'update-money-left')
      }
    },
  }
}

module.exports = WinningMultiState

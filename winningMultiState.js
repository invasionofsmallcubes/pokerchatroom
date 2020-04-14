const CardPrettiefier = require('./cardPrettifier')

const SHOW_PLAYING_PLAYERS = 'show-playing-players'

function WinningMultiState(winnerPlayers, room, poolPrize, tableStatus) {
  return {
    winnerPlayers,
    room,
    poolPrize,
    tableStatus,
    print(chat) {
      if (tableStatus) {
        const cp = CardPrettiefier()
        const prettyHands = tableStatus.hands.map((h) => ({
          cards: cp.prettify(h.cards),
          name: h.name,
        }))
        chat.toRoomInTopic(this.room, { hands: prettyHands }, SHOW_PLAYING_PLAYERS)
      }

      for (let i = 0; i < winnerPlayers.length; i += 1) {
        const p = this.winnerPlayers[i]
        chat.game(this.room, `Player ${p.user.name} wins ${poolPrize}!`)
        chat.toSelfInTopic(p.user.id, { money: p.money.toString() }, 'update-money-left')
      }
    },
  }
}

module.exports = WinningMultiState

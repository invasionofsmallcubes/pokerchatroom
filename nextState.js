const CardPrettiefier = require('./cardPrettifier')

function NextState(cards, room, nextState) {
  return {
    cards,
    room,
    nextState,
    print(chat) {
      chat.game(this.room, `Common cards are ${CardPrettiefier().prettify(this.cards)}`)
      nextState.print(chat)
    },
  }
}
module.exports = NextState

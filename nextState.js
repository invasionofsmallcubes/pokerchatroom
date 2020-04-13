const CardPrettiefier = require('./cardPrettifier')

const UPDATE_COMMON_CARDS = 'update-common-cards'

function NextState(cards, room, nextState) {
  return {
    cards,
    room,
    nextState,
    print(chat) {
      const prettyCards = CardPrettiefier().prettify(this.cards)
      chat.game(this.room, `Common cards are ${prettyCards}`)
      chat.toRoomInTopic(this.room, prettyCards.join(','), UPDATE_COMMON_CARDS)
      nextState.print(chat)
    },
  }
}
module.exports = NextState

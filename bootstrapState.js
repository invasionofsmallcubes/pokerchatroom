const CardPrettiefier = require('./cardPrettifier')

const BOOTSTRAP_STATE = 'bootstrap-state'

function BootstrapState(
  startedBy,
  roomId,
  dealerName,
  smallBlindName,
  bigBlindName,
  poolPrize,
  nextMoveFrom,
  hands
) {
  return {
    startedBy,
    roomId,
    dealerName,
    smallBlindName,
    bigBlindName,
    poolPrize,
    nextMoveFrom,
    hands,
    print(chat) {
      chat.game(this.roomId, `Game in room ${this.roomId} has started by ${this.startedBy}`)
      chat.game(this.roomId, `The dealer is ${this.dealerName}`)
      chat.game(this.roomId, `The small blind is ${this.smallBlindName}`)
      chat.game(this.roomId, `The big blind is ${this.bigBlindName}`)
      chat.game(this.roomId, `Current pool prize is: ${this.poolPrize}`)
      chat.game(this.roomId, 'Dealing cards...')
      for (let i = 0; i < this.hands.length; i += 1) {
        const hand = this.hands[i]
        const cards = CardPrettiefier().prettify(hand.cards)
        chat.toSelf(hand.id, `Your hand is ${cards}`)
        chat.toSelfInTopic(hand.id, { cards, prize: this.poolPrize }, BOOTSTRAP_STATE)
      }
      chat.game(this.roomId, `Waiting for move from ${this.nextMoveFrom}`)
    },
  }
}

module.exports = BootstrapState

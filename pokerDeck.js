const Deck = require('card-deck')

function resetDeck() {
  const currentDeck = new Deck()
  const seeds = ['c', 'h', 's', 'd']
  const value = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
  const cards = []
  for (let i = 0; i < seeds.length; i += 1) {
    for (let j = 0; j < value.length; j += 1) {
      cards.push(value[j] + [seeds[i]])
    }
  }
  currentDeck.cards(cards)
  currentDeck.shuffle()
  return currentDeck
}

function PokerDeck() {
  const deck = resetDeck()
  return {
    d: deck,
    drawTwoCards() {
      return this.d.draw(2)
    },
    drawThreeCards() {
      return this.d.draw(3)
    },
    drawOneCard() {
      this.d.draw(1)
      return this.d.draw(1)
    },
    remainings() {
      return this.d.remaining()
    },
    resetDeck() {
      this.d = resetDeck()
    },
  }
}

module.exports = PokerDeck

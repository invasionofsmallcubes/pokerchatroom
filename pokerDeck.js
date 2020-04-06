const Deck = require('card-deck')

function PokerDeck() {
  const deck = new Deck()
  const seeds = ['c', 'h', 's', 'd']
  const value = [
    'A',
    'K',
    'Q',
    'J',
    'T',
    '9',
    '8',
    '7',
    '6',
    '5',
    '4',
    '3',
    '2',
  ]
  const cards = []
  for (let i = 0; i < seeds.length; i += 1) {
    for (let j = 0; j < value.length; j += 1) {
      cards.push(value[j] + [seeds[i]])
    }
  }
  deck.cards(cards)
  deck.shuffle()
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
  }
}

module.exports = PokerDeck

const { Hand } = require('pokersolver')

function WinnerCalculator() {
  return {
    calculateWinningPlayer(cardExaminations) {
      const hands = []
      for (let i = 0; i < cardExaminations.length; i += 1) {
        const c = cardExaminations[i]
        const h = Hand.solve(c.hand)
        h.playerId = c.idx
        hands.push(h)
      }
      const handWinners = Hand.winners(hands)
      return handWinners
    },
  }
}

module.exports = WinnerCalculator

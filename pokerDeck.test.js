const PokerDeck = require('./pokerDeck')

test('I am able to generate 52 cards, able to draw and then reset', () => {
  const pokerDeck = PokerDeck()
  expect(pokerDeck.drawTwoCards().length).toBe(2)
  expect(pokerDeck.drawThreeCards().length).toBe(3)
  pokerDeck.drawOneCard()
  expect(pokerDeck.remainings()).toBe(45)
  pokerDeck.resetDeck()
  expect(pokerDeck.remainings()).toBe(52)
})

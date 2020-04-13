const CardPrettifier = require('./cardPrettifier')

test('I can prettify', () => {
  expect(CardPrettifier().prettify(['Ad', 'As', 'Jc', 'Th', '2d', '3c', 'Kd'])).toEqual([
    'A♦️',
    'A♠️',
    'J♣️',
    '10♥️',
    '2♦️',
    '3♣️',
    'K♦️',
  ])
})

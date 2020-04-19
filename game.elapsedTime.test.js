const Game = require('./game')
const ElapsedTimeState = require('./elapsedTimeState')
const t = require('./testHelpers')

test('I can say how much time has passed', () => {
  const timePassed = t.TimePassed()
  const game = Game('me', 'room', t.PokerDeck(), t.WinnerCalculator(), timePassed)
  expect(t.str(game.elapsedTime())).toBe(t.str(ElapsedTimeState('room', '1 minute')))
})

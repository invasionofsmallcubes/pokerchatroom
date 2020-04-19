const Game = require('./game')
const User = require('./user')
const t = require('./testHelpers')
const BlindUpdatedState = require('./blindUpdatedState')
const ErrorState = require('./errorState')

test("I can update blinds if I'm the owner", () => {
  const room = 'room'
  const user = User('name', room, 'id')
  const game = Game(user, room, t.PokerDeck(), t.WinnerCalculator())
  const state = game.updateBlinds(10, 15, user)
  const expectedState = BlindUpdatedState(room, 10, 15)
  expect(JSON.stringify(state)).toBe(JSON.stringify(expectedState))
  expect(game.smallBlind).toBe(10)
  expect(game.bigBlind).toBe(15)
})

test("I can't update blinds if I'm not the owner", () => {
  const room = 'room'
  const user = User('name', room, 'id')
  const user2 = User('name', room, 'id2')
  const game = Game(user, room, t.PokerDeck(), t.WinnerCalculator())
  game.addPlayer(user2)
  const state = game.updateBlinds(10, 15, user2)
  const expectedState = ErrorState(room, 'Only the owner can change the state')
  expect(JSON.stringify(state)).toBe(JSON.stringify(expectedState))
})

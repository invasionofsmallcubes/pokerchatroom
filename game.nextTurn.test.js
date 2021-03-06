const Game = require('./game')
const User = require('./user')

const t = require('./testHelpers')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

test('I can move to next step', () => {
  const pokerDeck = t.PokerDeck()
  const game = Game(user, room, pokerDeck, t.WinnerCalculator())
  game.addPlayer(user)
  game.addPlayer(user2)
  game.addPlayer(user3)
  game.bootstrapGame(user)

  game.fold(user)
  game.fold(user2)

  expect(game.lookupPlayer(user).money).toBe(100)
  expect(game.lookupPlayer(user2).money).toBe(95)
  expect(game.lookupPlayer(user3).money).toBe(105)

  const state = game.nextTurn(user)

  expect(game.currentStep).toBe(0)
  expect(game.dealer).toBe(1)
  expect(game.poolPrize).toBe(15)
  expect(game.lookupPlayer(user3).money).toBe(100)
  expect(game.lookupPlayer(user).money).toBe(90)
  expect(state.dealerName).toBe(user2.name)
  expect(game.players[0].bet).toBe(10)
  expect(game.players[1].bet).toBe(0)
  expect(game.players[2].bet).toBe(5)
  expect(pokerDeck.resetDeck.mock.calls.length).toBe(1)
  for (let i = 0; i < game.players.length; i += 1) {
    expect(game.players[i].hasFolded).toBe(false)
  }
})

test("I can't go to next turn if I'm not the owner", () => {
  const game = Game(user, room, t.PokerDeck(), t.WinnerCalculator())
  game.addPlayer(user)
  game.addPlayer(user2)
  game.addPlayer(user3)
  game.bootstrapGame(user)
  const state = game.nextTurn(user2)
  expect(state.message).toBe('You cannot next a game that you did not create')
})

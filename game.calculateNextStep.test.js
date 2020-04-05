const Game = require('./game')
const User = require('./user')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

let game

beforeEach(() => {
  game = Game(user, room)
  game.addPlayer(user)
  game.addPlayer(user2)
  game.addPlayer(user3)
  game.bootstrapGame(user)
})

test('I am able to compute flop', () => {
  game.call(user)
  game.call(user2)
  const nextState = game.call(user3)
  expect(nextState.nextState.nextState.nextPlayerName).toBe('name')
  expect(nextState.nextState.room).toBe(room)
  expect(nextState.nextState.cards).toEqual(['3', '4', '5'])
  expect(game.cardsOnTable).toEqual(['3', '4', '5'])
  expect(game.currentStep).toBe(1)
})

test('I am able to compute the turn', () => {
  game.call(user)
  game.call(user2)
  game.call(user3)

  game.call(user)
  game.call(user2)
  const nextState = game.call(user3)

  expect(nextState.nextState.nextState.nextPlayerName).toBe('name')
  expect(nextState.nextState.room).toBe(room)
  expect(nextState.nextState.cards).toEqual(['3', '4', '5', '6'])
  expect(game.cardsOnTable).toEqual(['3', '4', '5', '6'])
  expect(game.currentStep).toBe(2)
})

test('I am able to compute the flop', () => {
  game.call(user)
  game.call(user2)
  game.call(user3)

  game.call(user)
  game.call(user2)
  game.call(user3)

  game.call(user)
  game.call(user2)
  const nextState = game.call(user3)

  expect(nextState.nextState.nextState.nextPlayerName).toBe('name')
  expect(nextState.nextState.room).toBe(room)
  expect(nextState.nextState.cards).toEqual(['3', '4', '5', '6', '6'])
  expect(game.cardsOnTable).toEqual(['3', '4', '5', '6', '6'])
  expect(game.currentStep).toBe(3)
})

xtest('I am able to compute the showdown', () => {
  // preflop
  game.call(user)
  game.call(user2)
  game.call(user3)

  // flop
  game.call(user)
  game.call(user2)
  game.call(user3)

  // turn
  game.call(user)
  game.call(user2)
  game.call(user3)

  // river
  game.call(user)
  game.call(user2)
  const winningState = game.call(user3)

  expect(winningState.nextState.winnerPlayer).toBe('name3')
  expect(winningState.nextState.room).toBe(room)
  expect(game.lookupPlayer(user3).money).toBe(105)
  expect(game.poolPrize).toBe(0)
})

test("if everybody folds, the last one that didn't fold wins", () => {
  game.fold(user)
  const winningState = game.fold(user2)
  expect(winningState.nextState.winnerPlayer).toBe('name3')
  expect(winningState.nextState.room).toBe(room)
  expect(game.lookupPlayer(user3).money).toBe(105)
  expect(game.poolPrize).toBe(0)
})

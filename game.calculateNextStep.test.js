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

test("if everybody folds, the last one that didn't fold wins", () => {
  game.fold(user)
  const winningState = game.fold(user2)
  expect(winningState.nextState.winnerPlayer).toBe('name3')
  expect(winningState.nextState.room).toBe(room)
  expect(game.lookupPlayer(user3).money).toBe(105)
  expect(game.poolPrize).toBe(0)
})

test('I am able to compute river', () => {
  game.call(user)
  game.call(user2)
  const nextState = game.call(user3)
  expect(nextState.nextState.nextPlayerName.nextPlayerName).toBe('name')
  expect(nextState.nextState.room).toBe(room)
  expect(nextState.nextState.cards).toEqual(['3', '4', '5'])
  expect(game.cardsOnTable).toEqual(['3', '4', '5'])
})

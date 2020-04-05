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

test("I cannot bet on the game, if it's not my turn", () => {
  const errorState = game.raise(15, user2)
  expect(errorState.room).toBe('id2')
  expect(errorState.message).toBe(
    "You cannot !raise because it's not your turn"
  )
})

test("I can bet on the game, if it's my turn", () => {
  const gameState = game.raise(15, user)
  expect(game.lookupPlayer(user).money).toBe(85)
  expect(game.poolPrize).toBe(30)
  expect(gameState.room).toBe(room)
  expect(gameState.bettingPlayerName).toBe('name')
  expect(gameState.amount).toBe(15)
  expect(gameState.nextState.room).toBe('room')
  expect(gameState.nextState.nextPlayerName).toBe('name2')
})

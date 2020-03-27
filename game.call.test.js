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

test('I can call the higher bet on the table', () => {
  const state = game.call(user)
  expect(state.room).toBe('room')
  expect(state.callingPlayer).toBe('name')
  expect(state.amount).toBe(10)
  expect(state.nextPlayerName).toBe('name2')
})

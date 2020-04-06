const Game = require('./game')
const User = require('./user')
const WaitingState = require('./waitingState')

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
  const expectedWaitingState = WaitingState(room, 'name2')
  expect(state.nextState.room).toBe(expectedWaitingState.room)
  expect(state.nextState.nextPlayerName).toBe(
    expectedWaitingState.nextPlayerName
  )
  expect(state.poolPrize).toBe(25)
})
test('I can call the higher bet on the table', () => {
  const state = game.call(user)
  expect(state.room).toBe('room')
  expect(state.callingPlayer).toBe('name')
  expect(state.amount).toBe(10)
  expect(state.nextState.room).toBe(room)
  expect(state.nextState.nextPlayerName).toBe('name2')
  expect(state.poolPrize).toBe(25)
})

test('I can call the higher bet on the table and it becomes a check', () => {
  game.call(user)
  game.call(user2)
  const state = game.call(user3)
  expect(state.room).toBe('room')
  expect(state.checkingPlayer).toBe('name3')
  expect(state.nextState.nextState.room).toBe(room)
  expect(state.nextState.nextState.nextPlayerName).toBe('name')
})

test("I can't call the higher bet on the table when it's not my turn", () => {
  const errorState = game.call(user2)
  expect(errorState.room).toBe('id2')
  expect(errorState.message).toBe("You cannot !call because it's not your turn")
})

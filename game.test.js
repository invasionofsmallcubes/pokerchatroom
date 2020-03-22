const Game = require('./game')
const User = require('./user')

function Chat() {
  return {
    // eslint-disable-next-line no-unused-vars
    game: jest.fn((roomName, message) => {}),
    // eslint-disable-next-line no-unused-vars
    toSelf: jest.fn((id, message) => {})
  }
}
const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const game = Game(user, room)
game.addPlayer(user)
game.addPlayer(user2)
const chat = Chat()

test('I can bootstrap a game', () => {
  const state = game.bootstrapGame(user, chat)

  expect(state.startedBy).toBe(user.name)
  expect(state.roomId).toBe(room)
  expect(state.dealerName).toBe('name')
  expect(state.smallBlindName).toBe('name2')
  expect(state.bigBlindName).toBe('name')
  expect(state.poolPrize).toBe(15)
  expect(state.nextMoveFrom).toBe('name2')
  expect(state.hands[0].id).toBe('id')
  expect(state.hands[0].cards).toEqual(['1', '2'])
  expect(state.hands[1].id).toBe('id2')
  expect(state.hands[1].cards).toEqual(['1', '2'])

  // TODO put print login in state, the below needs to be removed
  expect(chat.game.mock.calls.length).toBe(7)
  expect(chat.game.mock.calls[0][0]).toBe(room)
  expect(chat.game.mock.calls[0][1]).toBe(
    'Game in room room has started by name'
  )
  expect(chat.game.mock.calls[1][0]).toBe(room)
  expect(chat.game.mock.calls[1][1]).toBe('The dealer is name')
  expect(chat.game.mock.calls[2][0]).toBe(room)
  expect(chat.game.mock.calls[2][1]).toBe('The small blind is name2')
  expect(chat.game.mock.calls[3][0]).toBe(room)
  expect(chat.game.mock.calls[3][1]).toBe('The big blind is name')
  expect(chat.game.mock.calls[4][0]).toBe(room)
  expect(chat.game.mock.calls[4][1]).toBe('Current pool prize is: 15')
  expect(chat.game.mock.calls[5][1]).toBe('Dealing cards...')
  expect(chat.game.mock.calls[6][0]).toBe(room)
  expect(chat.game.mock.calls[6][1]).toBe('Waiting for move from name2')
  expect(chat.toSelf.mock.calls.length).toBe(2)
  expect(chat.toSelf.mock.calls[0][0]).toBe('id')
  expect(chat.toSelf.mock.calls[0][1]).toBe('Your hand is 1 and 2')
  expect(chat.toSelf.mock.calls[1][0]).toBe('id2')
  expect(chat.toSelf.mock.calls[1][1]).toBe('Your hand is 1 and 2')
})

test("I can't bootstrap a game if not started by the owner", () => {
  expect(game.bootstrapGame(user2, chat)).toBeFalsy()
})

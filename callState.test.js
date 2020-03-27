const CallState = require('./callState')
const WaitingState = require('./waitingState')

function Chat() {
  return {
    // eslint-disable-next-line no-unused-vars
    game: jest.fn((roomName, message) => {
    }),
  }
}

test('I can print the message', () => {
  const room = 'room'
  const foldState = CallState('name2', room, WaitingState(room, 'name'), 10, 25)
  const chat = Chat()
  foldState.print(chat)
  expect(chat.game.mock.calls.length)
    .toBe(3)
  expect(chat.game.mock.calls[0][0])
    .toBe('room')
  expect(chat.game.mock.calls[0][1])
    .toBe('Player name2 has called (10)')
  expect(chat.game.mock.calls[1][0])
    .toBe('room')
  expect(chat.game.mock.calls[1][1])
    .toBe('The pool prize is 25')
  expect(chat.game.mock.calls[2][0])
    .toBe('room')
  expect(chat.game.mock.calls[2][1])
    .toBe('Waiting for move from name')
})

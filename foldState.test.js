const FoldState = require('./foldState')
const WaitingState = require('./waitingState')

function Chat() {
  return {
    // eslint-disable-next-line no-unused-vars
    gameExceptSender: jest.fn((roomName, message) => {}),
    // eslint-disable-next-line no-unused-vars
    game: jest.fn((roomName, message) => {}),
    // eslint-disable-next-line no-unused-vars
    toSelf: jest.fn((id, message) => {}),
  }
}

test('I can print the message', () => {
  const room = 'room'
  const foldState = FoldState('name2', room, WaitingState(room, 'name'))
  const chat = Chat()
  foldState.print(chat)
  expect(chat.game.mock.calls.length).toBe(1)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player name2 has folded')
})

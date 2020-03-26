const FoldState = require('./foldState')

function Chat() {
  return {
    // eslint-disable-next-line no-unused-vars
    game: jest.fn((roomName, message) => {
    }),
  }
}

test('I can print the message', () => {
  const foldState = FoldState('name2', 'room', 'name')
  const chat = Chat()
  foldState.print(chat)
  expect(chat.game.mock.calls.length)
    .toBe(2)
  expect(chat.game.mock.calls[0][0])
    .toBe('room')
  expect(chat.game.mock.calls[0][1])
    .toBe('Player name2 has folded')
  expect(chat.game.mock.calls[1][0])
    .toBe('room')
  expect(chat.game.mock.calls[1][1])
    .toBe('Waiting for move from name')
})

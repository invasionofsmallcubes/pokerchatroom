const WaitingState = require('./waitingState')

function Chat() {
  return {
    // eslint-disable-next-line no-unused-vars
    game: jest.fn((roomName, message) => {}),
  }
}

test('can print waiting player', () => {
  const chat = new Chat()
  const waitingState = WaitingState('room', 'nextPlayerName')
  waitingState.print(chat)

  expect(chat.game.mock.calls.length).toBe(1)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Waiting for move from nextPlayerName')
})

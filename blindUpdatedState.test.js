const t = require('./testHelpers')
const BlindUpdatedState = require('./blindUpdatedState')

test('I can update the chat about the blinds', () => {
  const bu = BlindUpdatedState('room', 5, 10)
  const chat = t.Chat()
  bu.print(chat)
  expect(chat.game.mock.calls.length).toBe(1)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Blinds updated: Small Blind is 5, Big Blind is 10')
})

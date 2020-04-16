const WaitingState = require('./waitingState')
const t = require('./testHelpers')

test('can print waiting player', () => {
  const chat = t.Chat()
  const waitingState = WaitingState('room', 'nextPlayerName', 'selfId')
  waitingState.print(chat)

  expect(chat.game.mock.calls.length).toBe(1)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Waiting for move from nextPlayerName')

  expect(chat.toSelf.mock.calls.length).toBe(1)
  expect(chat.toSelf.mock.calls[0][0]).toBe('selfId')
  expect(chat.toSelf.mock.calls[0][1]).toBe("It's your turn!")
})

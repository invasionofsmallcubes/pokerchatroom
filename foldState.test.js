const FoldState = require('./foldState')
const WaitingState = require('./waitingState')
const t = require('./testHelpers')

test('I can print the message', () => {
  const room = 'room'
  const foldState = FoldState('name2', room, WaitingState(room, 'name'))
  const chat = t.Chat()
  foldState.print(chat)
  expect(chat.game.mock.calls.length).toBe(2)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player name2 has folded')
})

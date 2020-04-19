const CallState = require('./callState')
const WaitingState = require('./waitingState')
const t = require('./testHelpers')

test('I can print the message', () => {
  const room = 'room'
  const callState = CallState('name2', room, WaitingState(room, 'name'), 10, 25, {
    money: 33,
    id: 'id2',
  })

  const chat = t.Chat()

  callState.print(chat)
  expect(chat.game.mock.calls.length).toBe(3)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player name2 has called (10)')
  expect(chat.game.mock.calls[1][0]).toBe('room')
  expect(chat.game.mock.calls[1][1]).toBe('The pool prize is 25')

  expect(chat.toSelfInTopic.mock.calls.length).toBe(1)
  expect(chat.toSelfInTopic.mock.calls[0][0]).toBe('id2')
  expect(chat.toSelfInTopic.mock.calls[0][1]).toEqual({ money: 33, id: 'id2' })
  expect(chat.toSelfInTopic.mock.calls[0][2]).toBe('update-money-left')

  expect(chat.toRoomInTopic.mock.calls.length).toBe(1)
  expect(chat.toRoomInTopic.mock.calls[0][0]).toBe('room')
  expect(chat.toRoomInTopic.mock.calls[0][1]).toEqual({ poolPrize: 25 })
  expect(chat.toRoomInTopic.mock.calls[0][2]).toBe('update-pool-prize')
})

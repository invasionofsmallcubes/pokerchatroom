const RaiseState = require('./raiseState')
const WaitingState = require('./waitingState')

function Chat() {
  return {
    // eslint-disable-next-line no-unused-vars
    gameExceptSender: jest.fn((roomName, message) => {}),
    // eslint-disable-next-line no-unused-vars
    game: jest.fn((roomName, message) => {}),
    // eslint-disable-next-line no-unused-vars
    toSelf: jest.fn((id, message) => {}),
    // eslint-disable-next-line no-unused-vars
    toSelfInTopic: jest.fn((id, message, topic) => {}),
    // eslint-disable-next-line no-unused-vars
    toRoomInTopic: jest.fn((room, message, topic) => {}),
  }
}

test('I can print the message', () => {
  const room = 'room'
  const raiseState = RaiseState(
    'name2',
    room,
    10,
    WaitingState(room, 'name'),
    {
      money: 33,
      id: 'id2',
    },
    25
  )
  const chat = Chat()
  raiseState.print(chat)
  expect(chat.game.mock.calls.length).toBe(1)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player name2 raise to 10')

  expect(chat.toSelfInTopic.mock.calls.length).toBe(1)
  expect(chat.toSelfInTopic.mock.calls[0][0]).toBe('id2')
  expect(chat.toSelfInTopic.mock.calls[0][1]).toEqual({ money: 33, id: 'id2' })
  expect(chat.toSelfInTopic.mock.calls[0][2]).toBe('update-self-status')

  expect(chat.toRoomInTopic.mock.calls.length).toBe(1)
  expect(chat.toRoomInTopic.mock.calls[0][0]).toBe('room')
  expect(chat.toRoomInTopic.mock.calls[0][1]).toEqual({ poolPrize: 25 })
  expect(chat.toRoomInTopic.mock.calls[0][2]).toBe('update-pool-prize')
})

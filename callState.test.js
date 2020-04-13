const CallState = require('./callState')
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
  }
}

test('I can print the message', () => {
  const room = 'room'
  const foldState = CallState('name2', room, WaitingState(room, 'name'), 10, 25, {
    money: 33,
    id: 'id2',
  })
  const chat = Chat()
  foldState.print(chat)
  expect(chat.game.mock.calls.length).toBe(2)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player name2 has called (10)')
  expect(chat.game.mock.calls[1][0]).toBe('room')
  expect(chat.game.mock.calls[1][1]).toBe('The pool prize is 25')

  expect(chat.toSelfInTopic.mock.calls.length).toBe(1)
  expect(chat.toSelfInTopic.mock.calls[0][0]).toBe('id2')
  expect(chat.toSelfInTopic.mock.calls[0][1]).toEqual({ money: 33, id: 'id2' })
  expect(chat.toSelfInTopic.mock.calls[0][2]).toBe('update-self-status')
})

const NextState = require('./nextState')

function Chat() {
  return {
    // eslint-disable-next-line no-unused-vars
    game: jest.fn((roomName, message) => { }),
    // eslint-disable-next-line no-unused-vars
    toRoomInTopic: jest.fn((room, message, topic) => { }),
  }
}

function NextStateMock() {
  return {
    // eslint-disable-next-line no-unused-vars
    print: jest.fn((chat) => { }),

  }
}

test("I can bet on the game, if it's my turn", () => {
  const chat = Chat()
  const nextStateMock = NextStateMock()
  const nextState = NextState(['9h'], 'room', nextStateMock)
  nextState.print(chat)

  expect(chat.game.mock.calls.length).toBe(1)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Common cards are 9♥️')

  expect(chat.toRoomInTopic.mock.calls.length)
  expect(chat.toRoomInTopic.mock.calls[0][0]).toBe('room')
  expect(chat.toRoomInTopic.mock.calls[0][1]).toBe('9♥️')
  expect(chat.toRoomInTopic.mock.calls[0][2]).toBe('update-common-cards')
})

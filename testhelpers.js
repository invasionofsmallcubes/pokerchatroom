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

exports.Chat = Chat

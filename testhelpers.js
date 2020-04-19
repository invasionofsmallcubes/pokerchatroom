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

function PokerDeck() {
  return {
    drawTwoCards() {
      return ['1', '2']
    },
    drawThreeCards() {
      return ['3', '4', '5']
    },
    drawOneCard() {
      return '6'
    },
    resetDeck: jest.fn(() => {}),
  }
}

function WinnerCalculator() {
  return {
    // eslint-disable-next-line no-unused-vars
    calculateWinningPlayer: jest.fn((cardsExaminations) => [{ playerId: 2 }]),
  }
}

function TimePassed() {
  return {
    count: jest.fn(() => '1 minute'),
  }
}

function str(object) {
  return JSON.stringify(object)
}

exports.Chat = Chat
exports.PokerDeck = PokerDeck
exports.TimePassed = TimePassed
exports.WinnerCalculator = WinnerCalculator
exports.str = str

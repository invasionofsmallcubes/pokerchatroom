const Game = require('./game')
const User = require('./user')
const CardExamination = require('./cardExamination')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

const winnerCalculator = function WinnerCalculator() {
  return {
    // eslint-disable-next-line no-unused-vars
    calculateWinningPlayer: jest.fn((cardsExaminations) => 2),
  }
}

const pokerDeck = function PokerDeck() {
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
  }
}

let game

const winCalc = winnerCalculator()

beforeEach(() => {
  game = Game(user, room, pokerDeck(), winCalc)
  game.addPlayer(user)
  game.addPlayer(user2)
  game.addPlayer(user3)
  game.bootstrapGame(user)
})

test('I am able to compute the showdown', () => {
  // preflop
  game.call(user)
  game.call(user2)
  game.call(user3)

  // flop
  game.call(user)
  game.call(user2)
  game.call(user3)

  // turn
  game.call(user)
  game.call(user2)
  game.call(user3)

  // river
  game.fold(user)
  game.call(user2)
  const winningState = game.call(user3)

  expect(game.currentStep).toBe(4)
  expect(winningState.nextState.winnerPlayer).toBe('name3')
  expect(winningState.nextState.room).toBe(room)
  expect(game.lookupPlayer(user3).money).toBe(120) // wrong, calc win
  expect(game.poolPrize).toBe(30)
  expect(winCalc.calculateWinningPlayer.mock.calls.length).toBe(1)
  const expectedCall = [
    CardExamination(1, ['1', '2', '3', '4', '5', '6', '6']),
    CardExamination(2, ['1', '2', '3', '4', '5', '6', '6']),
  ]
  expect(winCalc.calculateWinningPlayer.mock.calls[0][0]).toEqual(expectedCall)
})

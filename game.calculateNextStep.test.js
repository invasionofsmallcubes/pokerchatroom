const Game = require('./game')
const User = require('./user')
const WinningMultiState = require('./winningMultiState')
const Player = require('./player')
const WaitingState = require('./waitingState')
const NextState = require('./nextState')
const CheckingState = require('./checkingState')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

let game

function aWinningState(money, poolPrize) {
  const p = Player(user3, money)
  p.bet = 10
  p.hand = ['1', '2']
  return WinningMultiState([p], room, poolPrize)
}

// eslint-disable-next-line no-unused-vars
function aWinningStateNoFold(money, poolPrize) {
  const p = Player(user3, money)
  p.bet = 10
  p.hand = ['1', '2']
  return WinningMultiState([p], room, poolPrize, {
    hands: [{ cards: ['1', '2'], name: user3.name }],
  })
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

beforeEach(() => {
  const winnerCalculator = function WinnerCalculator() {
    return {
      calculateWinningPlayer: () => [{ playerId: 2 }],
    }
  }
  game = Game(user, room, pokerDeck(), winnerCalculator())
  game.addPlayer(user)
  game.addPlayer(user2)
  game.addPlayer(user3)
  game.bootstrapGame(user)
})

test('I am able to compute flop', () => {
  game.call(user)
  game.call(user2)
  const nextState = game.call(user3)

  const ws = WaitingState(room, user.name, user.id)
  const ns = NextState(['3', '4', '5'], room, ws)
  const cs = CheckingState(user3.name, room, ns)

  expect(JSON.stringify(nextState)).toBe(JSON.stringify(cs))
  expect(game.cardsOnTable).toEqual(['3', '4', '5'])
  expect(game.currentStep).toBe(1)
})

test('I am able to compute the turn', () => {
  game.call(user)
  game.call(user2)
  game.call(user3)

  game.call(user)
  game.call(user2)
  const nextState = game.call(user3)

  expect(nextState.nextState.nextState.nextPlayerName).toBe('name')
  expect(nextState.nextState.room).toBe(room)
  expect(nextState.nextState.cards).toEqual(['3', '4', '5', '6'])
  expect(game.cardsOnTable).toEqual(['3', '4', '5', '6'])
  expect(game.currentStep).toBe(2)
})

test('I am able to compute the flop', () => {
  game.call(user)
  game.call(user2)
  game.call(user3)

  game.call(user)
  game.call(user2)
  game.call(user3)

  game.call(user)
  game.call(user2)
  const nextState = game.call(user3)

  expect(nextState.nextState.nextState.nextPlayerName).toBe('name')
  expect(nextState.nextState.room).toBe(room)
  expect(nextState.nextState.cards).toEqual(['3', '4', '5', '6', '6'])
  expect(game.cardsOnTable).toEqual(['3', '4', '5', '6', '6'])
  expect(game.currentStep).toBe(3)
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
  game.call(user)
  game.call(user2)
  const winningState = game.call(user3)

  expect(game.currentStep).toBe(4)

  const poolPrize = 30

  expect(JSON.stringify(winningState.nextState)).toBe(JSON.stringify(aWinningState(120, poolPrize)))
  expect(game.lookupPlayer(user3).money).toBe(120) // wrong, calc win
  expect(game.poolPrize).toBe(poolPrize)
})

test("if everybody folds, the last one that didn't fold wins", () => {
  game.fold(user)
  const winningState = game.fold(user2)

  expect(JSON.stringify(winningState.nextState)).toBe(JSON.stringify(aWinningState(105, 15)))
})

const Game = require('./game')
const User = require('./user')
const t = require('./testHelpers')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

let game

beforeEach(() => {
  const winnerCalculator = function WinnerCalculator() {
    return {
      calculateWinningPlayer: () => [{ playerId: 2 }, { playerId: 1 }],
    }
  }
  game = Game(user, room, t.PokerDeck(), winnerCalculator())
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
  game.call(user2)
  game.call(user3)
  game.call(user)

  // turn
  game.call(user2)
  game.call(user3)
  game.call(user)

  // river
  game.call(user2)
  game.call(user3)
  const winningState = game.fold(user)

  expect(game.currentStep).toBe(4)
  expect(game.poolPrize).toBe(30)
  expect(winningState.nextState.winnerPlayers[0].user.name).toBe('name3')
  expect(winningState.nextState.winnerPlayers[0].money).toBe(105)
  expect(winningState.nextState.winnerPlayers[1].user.name).toBe('name2')
  expect(winningState.nextState.winnerPlayers[1].money).toBe(105)
  expect(winningState.nextState.room).toBe(room)
})

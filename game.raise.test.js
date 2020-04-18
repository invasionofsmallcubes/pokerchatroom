const Game = require('./game')
const User = require('./user')
const RaiseState = require('./raiseState')
const WaitingState = require('./waitingState')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

let game

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
  game = Game(user, room, pokerDeck())
  game.addPlayer(user)
  game.addPlayer(user2)
  game.addPlayer(user3)
  game.bootstrapGame(user)
})

test("I cannot bet on the game, if it's not my turn", () => {
  const errorState = game.raise(15, user2)
  expect(errorState.room).toBe('id2')
  expect(errorState.message).toBe("You cannot !raise because it's not your turn")
})

test("I cannot bet on the game, if it's lower than bet", () => {
  const errorState = game.raise(5, user)
  expect(errorState.room).toBe('id')
  expect(errorState.message).toBe(
    `You cannot !raise because you have to raise more than ${game.highestBet + game.bigBlind}`
  )
})

test("I can bet on the game, if it's my turn", () => {
  const amount = 20
  const poolPrize = 35
  const money = 80
  const gameState = game.raise(amount, user)
  expect(game.lookupPlayer(user).money).toBe(money)
  expect(game.lookupPlayer(user).bet).toBe(amount)
  expect(game.poolPrize).toBe(poolPrize)
  expect(game.lastPlayerInTurn).toBe(2)

  const expectedState = RaiseState(
    user.name,
    room,
    amount,
    WaitingState(room, user2.name, user2.id),
    {
      money,
      id: user.id,
    },
    poolPrize
  )
  expect(JSON.stringify(gameState)).toBe(JSON.stringify(expectedState))
})

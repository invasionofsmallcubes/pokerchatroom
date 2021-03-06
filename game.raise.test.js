const Game = require('./game')
const User = require('./user')
const RaiseState = require('./raiseState')
const WaitingState = require('./waitingState')
const t = require('./testHelpers')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

let game

beforeEach(() => {
  game = Game(user, room, t.PokerDeck())
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

test("I cannot bet on the game, if I don't have the money", () => {
  const errorState = game.raise(1000, user)
  expect(errorState.room).toBe('id')
  expect(errorState.message).toBe('You cannot !raise because you only have 100')
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
  expect(game.highestBet).toBe(20)

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

test("I can bet on the game, if it's my turn after another one folded", () => {
  const amount = 20
  const poolPrize = 35
  const money = 75
  game.fold(user)
  const gameState = game.raise(amount, user2)
  expect(game.lookupPlayer(user2).money).toBe(money)
  expect(game.lookupPlayer(user2).bet).toBe(25)
  expect(game.poolPrize).toBe(poolPrize)
  expect(game.lastPlayerInTurn).toBe(2)
  const expectedState = RaiseState(
    user2.name,
    room,
    amount,
    WaitingState(room, user3.name, user3.id),
    {
      money,
      id: user2.id,
    },
    poolPrize
  )
  expect(JSON.stringify(gameState)).toBe(JSON.stringify(expectedState))

  game.raise(amount + 10, user3)
  expect(game.lastPlayerInTurn).toBe(1)
})

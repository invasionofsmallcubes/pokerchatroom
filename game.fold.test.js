const Game = require('./game')
const User = require('./user')
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

test("I can bet on the game, if it's my turn", () => {
  const foldState = game.fold(user)
  expect(foldState.foldingPlayerName).toBe('name')
  const expectedWaitingState = WaitingState(room, 'name2')
  expect(foldState.nextState.room).toBe(expectedWaitingState.room)
  expect(foldState.nextState.nextPlayerName).toBe(
    expectedWaitingState.nextPlayerName
  )
  expect(foldState.room).toBe('room')
})

test("I cannot bet on the game, if it's not my turn", () => {
  const errorState = game.fold(user2)
  expect(errorState.room).toBe('id2')
  expect(errorState.message).toBe("You cannot !fold because it's not your turn")
})

test('The next player will be the one that has not already folded', () => {
  const user4 = User('name4', room, 'id4')

  const game1 = Game(user, room, pokerDeck())
  game1.addPlayer(user)
  game1.addPlayer(user2)
  game1.addPlayer(user3)
  game1.addPlayer(user4)
  game1.bootstrapGame(user)

  game1.players[1].hasFolded = true
  const foldState = game1.fold(user4)
  expect(foldState.nextState.room).toBe(room)
  expect(foldState.nextState.nextPlayerName).toBe('name')
})

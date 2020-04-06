const Game = require('./game')
const User = require('./user')

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
const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const game = Game(user, room, pokerDeck())
game.addPlayer(user)
game.addPlayer(user2)

test('I can bootstrap a game', () => {
  const state = game.bootstrapGame(user)

  expect(game.lastPlayerInTurn).toBe(0)
  expect(state.startedBy).toBe(user.name)
  expect(state.roomId).toBe(room)
  expect(state.dealerName).toBe('name')
  expect(state.smallBlindName).toBe('name2')
  expect(state.bigBlindName).toBe('name')
  expect(state.poolPrize).toBe(15)
  expect(state.nextMoveFrom).toBe('name2')
  expect(state.hands[0].id).toBe('id')
  expect(state.hands[0].cards).toEqual(['1', '2'])
  expect(state.hands[1].id).toBe('id2')
  expect(state.hands[1].cards).toEqual(['1', '2'])
})

test("I can't bootstrap a game if not started by the owner", () => {
  const errorState = game.bootstrapGame(user2)
  expect(errorState.room).toBe(user2.id)
  expect(errorState.message).toBe(
    'You cannot start a game that you did not create'
  )
})

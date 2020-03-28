const Game = require('./game')
const User = require('./user')

const room = 'room'
const user = User('name', room, 'id')
const user2 = User('name2', room, 'id2')
const user3 = User('name3', room, 'id3')

let game

beforeEach(() => {
  game = Game(user, room)
  game.addPlayer(user)
  game.addPlayer(user2)
  game.addPlayer(user3)
  game.bootstrapGame(user)
})
// TODO recheck the rules
test('I can print the message', () => {
  game.fold(user)
  game.fold(user2)
  // const winningState = game.call(user3)
  // expect(winningState.nextPlayerName.winnerPlayer).toBe('name3')
  // expect(winningState.nextPlayerName.room).toBe(room)
})

const Player = require('./player')

const GAME_MESSAGE = 'game-message'
const ERROR_MESSAGE = 'error-message'
const PERSONAL_MESSAGE = 'personal-message'

function Game(owner, id) {
  return {
    owner,
    id,
    players: [],
    hasNotStartedYet: true,
    dealer: undefined,
    round: undefined,
    smallBlind: 5,
    bigBlind: 10,
    playerSize: 0,
    highestBet: 0,
    deck: {
      drawTwoCards() {
        return ['1', '2']
      },
      drawThreeCards() {
        return ['3', '4', '5']
      },
      drawOneCard() {
        return ['6']
      },
    },
    addPlayer(user) {
      if (this.hasNotStartedYet) {
        this.players.push(Player(user, 100))
        this.playerSize += 1
      }
      return this.hasNotStartedYet
    },
    isPlayerInTurn(user) {
      const currentPlayer = this.players[this.waitingPlayer]
      return user.id === currentPlayer.user.id
    },
    raise(amount, user, comms) {
      comms.to(user.id).emit(ERROR_MESSAGE, `not supported command !raise ${amount}`)
    },
    call(user, comms) {
      comms.to(user.id).emit(ERROR_MESSAGE, 'not supported command !call')
    },
    fold(user, comms) {
      const currentPlayer = this.players.filter((p) => p.user.id === user.id)[0]
      currentPlayer.hasFolded = true
      this.waitingPlayer = (this.waitingPlayer + 1) % this.playerSize
      comms.to(this.id).emit(GAME_MESSAGE, `Player ${user.name} has folded`)
      comms.to(this.id).emit(GAME_MESSAGE, `Waiting for move from ${this.players[this.waitingPlayer].user.name}`)
    },
    bootstrapGame(userAsking, comms) {
      if (this.owner === userAsking) {
        this.hasNotStartedYet = false
        comms.to(this.id).emit(GAME_MESSAGE, `Game in room ${this.id} has started by ${owner.name}`)
        this.round = 0
        const l = this.players.length
        this.dealer = this.round % l
        const smallBlind = (this.dealer + 1) % l
        const bigBlind = (this.dealer + 2) % l
        this.players[(this.dealer + 1) % l].money -= this.smallBlind
        this.players[(this.dealer + 2) % l].money -= this.bigBlind
        this.plate = this.bigBlind + this.smallBlind
        this.waitingPlayer = (this.dealer + 3) % l
        this.highestBet = this.bigBlind
        comms.to(this.id).emit(GAME_MESSAGE, `The dealer is ${this.players[this.dealer].user.name}`)
        comms.to(this.id).emit(GAME_MESSAGE, `The small blind is ${this.players[smallBlind].user.name}`)
        comms.to(this.id).emit(GAME_MESSAGE, `The big blind is ${this.players[bigBlind].user.name}`)
        comms.to(this.id).emit(GAME_MESSAGE, `Current pool prize is: ${this.plate}`)
        comms.to(this.id).emit(GAME_MESSAGE, 'Dealing cards...')

        for (let i = 0; i < this.playerSize; i += 1) {
          const handPlayer = this.players[(this.dealer + i) % this.playerSize]
          handPlayer.hand = this.deck.drawTwoCards()
          comms.to(handPlayer.user.id).emit(PERSONAL_MESSAGE, `Your hand is ${handPlayer.hand[0]} and ${handPlayer.hand[1]}`)
        }

        comms.to(this.id).emit(GAME_MESSAGE, `Waiting for move from ${this.players[this.waitingPlayer].user.name}`)
        return true
      }
      return false
    },
  }
}

module.exports = Game

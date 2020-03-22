const Player = require('./player')

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
    raise(amount, user, chat) {
      chat.error(user.id, `not supported command !raise ${amount}`)
    },
    call(user, chat) {
      chat.error(user.id, 'not supported command !call')
    },
    fold(user, chat) {
      const currentPlayer = this.players.filter((p) => p.user.id === user.id)[0]
      currentPlayer.hasFolded = true
      this.waitingPlayer = (this.waitingPlayer + 1) % this.playerSize
      chat.game(this.id, `Player ${user.name} has folded`)
      chat.game(this.id, `Waiting for move from ${this.players[this.waitingPlayer].user.name}`)
    },
    bootstrapGame(userAsking, chat) {
      if (this.owner === userAsking) {
        this.hasNotStartedYet = false
        chat.game(this.id, `Game in room ${this.id} has started by ${owner.name}`)
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
        chat.game(this.id, `The dealer is ${this.players[this.dealer].user.name}`)
        chat.game(this.id, `The small blind is ${this.players[smallBlind].user.name}`)
        chat.game(this.id, `The big blind is ${this.players[bigBlind].user.name}`)
        chat.game(this.id, `Current pool prize is: ${this.plate}`)
        chat.game(this.id, 'Dealing cards...')
        for (let i = 0; i < this.playerSize; i += 1) {
          const handPlayer = this.players[(this.dealer + i) % this.playerSize]
          handPlayer.hand = this.deck.drawTwoCards()
          chat.toSelf(handPlayer.user.id, `Your hand is ${handPlayer.hand[0]} and ${handPlayer.hand[1]}`)
        }
        chat.game(this.id, `Waiting for move from ${this.players[this.waitingPlayer].user.name}`)
        return true
      }
      return false
    },
  }
}

module.exports = Game

const Player = require('./player')
const ErrorState = require('./errorState')
const FoldState = require('./foldState')
const CallState = require('./callState')
const BootstrapState = require('./bootstrapState')

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
    poolPrize: 0,
    deck: {
      drawTwoCards() {
        return ['1', '2']
      },
      drawThreeCards() {
        return ['3', '4', '5']
      },
      drawOneCard() {
        return ['6']
      }
    },
    addPlayer(user) {
      if (this.hasNotStartedYet) {
        this.players.push(Player(user, 100))
        this.playerSize += 1
      }
      return this.hasNotStartedYet
    },
    lookupPlayer(user) {
      return this.players.filter((p) => p.user.id === user.id)[0]
    },
    isPlayerInTurn(user) {
      const currentPlayer = this.players[this.waitingPlayer]
      return user.id === currentPlayer.user.id
    },
    raise(amount, user, chat) {
      chat.error(user.id, `not supported command !raise ${amount}`)
    },
    calculateWaitingPlayer(user) {
      const currentPlayer = this.lookupPlayer(user)
      currentPlayer.hasFolded = true
      for (let i = 1; i < this.playerSize; i += 1) {
        const temporaryWaitingPlayer = (this.waitingPlayer + i) % this.playerSize
        if (!this.players[temporaryWaitingPlayer].hasFolded) {
          return temporaryWaitingPlayer
        }
      }
      return ErrorState(this.id, 'Not found a next player')
    },
    pokerAction(user, actionName, singlePokerAction) {
      if (!this.isPlayerInTurn(user)) {
        return ErrorState(user.id, `You cannot !${actionName} because it's not your turn`)
      }
      return singlePokerAction(user)
    },
    call(user) {
      return this.pokerAction(user, 'call', () => {
        const currentPlayer = this.lookupPlayer(user)
        currentPlayer.money -= this.highestBet
        this.poolPrize += this.highestBet
        this.waitingPlayer = this.calculateWaitingPlayer(user)
        return CallState(user.name,
          this.id,
          this.players[this.waitingPlayer].user.name,
          this.highestBet,
          this.poolPrize)
      })
    },
    fold(user) {
      return this.pokerAction(user, 'fold', () => {
        this.waitingPlayer = this.calculateWaitingPlayer(user)
        return FoldState(
          user.name,
          this.id,
          this.players[this.waitingPlayer].user.name
        )
      })
    },
    bootstrapGame(userAsking) {
      if (this.owner === userAsking) {
        this.hasNotStartedYet = false
        this.round = 0
        const l = this.players.length
        this.dealer = this.round % l
        const smallBlind = (this.dealer + 1) % l
        const bigBlind = (this.dealer + 2) % l
        this.players[(this.dealer + 1) % l].money -= this.smallBlind
        this.players[(this.dealer + 2) % l].money -= this.bigBlind
        this.poolPrize = this.bigBlind + this.smallBlind
        this.waitingPlayer = (this.dealer + 3) % l
        this.highestBet = this.bigBlind
        for (let i = 0; i < this.playerSize; i += 1) {
          const handPlayer = this.players[(this.dealer + i) % this.playerSize]
          handPlayer.hand = this.deck.drawTwoCards()
        }

        return BootstrapState(
          owner.name,
          this.id,
          this.players[this.dealer].user.name,
          this.players[smallBlind].user.name,
          this.players[bigBlind].user.name,
          this.poolPrize,
          this.players[this.waitingPlayer].user.name,
          this.players.map((player) => ({
            id: player.user.id,
            cards: player.hand
          }))
        )
      }
      return ErrorState(
        userAsking.id,
        'You cannot start a game that you did not create'
      )
    }
  }
}

module.exports = Game

const Player = require('./player')
const ErrorState = require('./errorState')
const FoldState = require('./foldState')
const CallState = require('./callState')
const BootstrapState = require('./bootstrapState')
const WaitingState = require('./waitingState')
const RaiseState = require('./raiseState')
const WinningState = require('./winningState')
const FlopState = require('./flopState')
const CheckingState = require('./checkingState')

function Game(owner, id) {
  return {
    owner,
    id,
    players: [],
    hasNotStartedYet: true,
    dealer: undefined,
    round: undefined,
    lastPlayerInTurn: undefined,
    smallBlind: 5,
    bigBlind: 10,
    playerSize: 0,
    highestBet: 0,
    poolPrize: 0,
    // preflop = 0, flop = 1, turn = 2, river = 3, showdown = 4
    currentStep: 0,
    deck: {
      drawTwoCards() {
        return ['1', '2']
      },
      drawThreeCards() {
        return ['3', '4', '5']
      },
      drawOneCard() {
        return '6'
      },
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
    calculateWinningPlayer() {
      return this.players[2]
    },
    calculateNextPlayer() {
      for (let i = 1; i < this.playerSize; i += 1) {
        // eslint-disable-next-line operator-linebreak
        const temporaryWaitingPlayer =
          (this.waitingPlayer + i) % this.playerSize
        if (!this.players[temporaryWaitingPlayer].hasFolded) {
          this.waitingPlayer = temporaryWaitingPlayer
          return WaitingState(
            this.id,
            this.players[temporaryWaitingPlayer].user.name
          )
        }
      }
      return ErrorState(this.id, 'Not found a next player')
    },
    everyPlayerHasFolded() {
      const playersThatDidntFold = this.players.filter((p) => !p.hasFolded)
      return playersThatDidntFold.length === 1
    },
    playerNotFolding() {
      return this.players.filter((p) => !p.hasFolded)[0]
    },
    calculateNextStep() {
      if (this.everyPlayerHasFolded()) {
        const winner = this.playerNotFolding()
        winner.money += this.poolPrize
        this.poolPrize = 0
        return WinningState(winner.user.name, this.id)
      }
      if (this.lastPlayerInTurn === this.waitingPlayer) {
        if (this.currentStep === 3) {
          this.currentStep += 1
          const p = this.calculateWinningPlayer()
          p.money += this.poolPrize
          return WinningState(p.user.name, this.id)
        }
        if (this.currentStep === 0) {
          this.cardsOnTable = this.deck.drawThreeCards()
        } else {
          this.cardsOnTable.push(this.deck.drawOneCard())
        }
        this.currentStep += 1
        return FlopState(this.cardsOnTable, this.id, this.calculateNextPlayer())
      }
      return this.calculateNextPlayer()
    },
    pokerAction(user, actionName, singlePokerAction) {
      if (!this.isPlayerInTurn(user)) {
        return ErrorState(
          user.id,
          `You cannot !${actionName} because it's not your turn`
        )
      }
      return singlePokerAction(user)
    },
    call(user) {
      return this.pokerAction(user, 'call', () => {
        const currentPlayer = this.lookupPlayer(user)
        if (currentPlayer.bet < this.highestBet) {
          const moneyToAdd = this.highestBet - currentPlayer.bet
          currentPlayer.money -= moneyToAdd
          currentPlayer.bet += moneyToAdd
          this.poolPrize += moneyToAdd
          return CallState(
            user.name,
            this.id,
            this.calculateNextStep(),
            this.highestBet,
            this.poolPrize
          )
        }
        return CheckingState(user.name, this.id, this.calculateNextStep())
      })
    },
    fold(user) {
      return this.pokerAction(user, 'fold', () => {
        const currentPlayer = this.lookupPlayer(user)
        currentPlayer.hasFolded = true
        return FoldState(user.name, this.id, this.calculateNextStep())
      })
    },
    raise(amount, user) {
      return this.pokerAction(user, 'raise', () => {
        const currentPlayer = this.lookupPlayer(user)
        currentPlayer.money -= amount
        currentPlayer.bet += amount
        this.poolPrize += amount
        return RaiseState(user.name, this.id, amount, this.calculateNextStep())
      })
    },
    bootstrapGame(userAsking) {
      if (this.owner === userAsking) {
        this.hasNotStartedYet = false
        this.hasNotStartedYet = false
        this.round = 0
        this.dealer = this.round % this.playerSize
        const smallBlindIdx = (this.dealer + 1) % this.playerSize
        const bigBlindIdx = (this.dealer + 2) % this.playerSize
        this.players[smallBlindIdx].money -= this.smallBlind
        this.players[smallBlindIdx].bet += this.smallBlind
        this.players[bigBlindIdx].money -= this.bigBlind
        this.players[bigBlindIdx].bet += this.bigBlind
        this.poolPrize = this.bigBlind + this.smallBlind
        this.waitingPlayer = (this.dealer + 3) % this.playerSize
        this.highestBet = this.bigBlind
        this.lastPlayerInTurn = bigBlindIdx
        for (let i = 0; i < this.playerSize; i += 1) {
          const handPlayer = this.players[(this.dealer + i) % this.playerSize]
          handPlayer.hand = this.deck.drawTwoCards()
        }

        return BootstrapState(
          owner.name,
          this.id,
          this.players[this.dealer].user.name,
          this.players[smallBlindIdx].user.name,
          this.players[bigBlindIdx].user.name,
          this.poolPrize,
          this.players[this.waitingPlayer].user.name,
          this.players.map((player) => ({
            id: player.user.id,
            cards: player.hand,
          }))
        )
      }
      return ErrorState(
        userAsking.id,
        'You cannot start a game that you did not create'
      )
    },
  }
}

module.exports = Game

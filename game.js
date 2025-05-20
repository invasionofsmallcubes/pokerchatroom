const Player = require('./player')
const CardExamination = require('./cardExamination')
const ErrorState = require('./errorState')
const FoldState = require('./foldState')
const CallState = require('./callState')
const BootstrapState = require('./bootstrapState')
const WaitingState = require('./waitingState')
const RaiseState = require('./raiseState')
const WinningMultiState = require('./winningMultiState')
const NextState = require('./nextState')
const CheckingState = require('./checkingState')
const BlindUpdatedState = require('./blindUpdatedState')
const ElapsedTimeState = require('./elapsedTimeState')
const PlayerJoinedState = require('./playerJoinedState')

function Game(owner, id, deck, winnerCalculator, timePassed) {
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
    highestBet: 0, // Highest bet in the current betting round
    poolPrize: 0, // Grand total money bet in the hand from ALL players (including folded)
    pots: [], // For side pot calculation at showdown, structure: { amount: X, eligiblePlayers: [playerObj] }
    minimumRaiseAmount: 0, // Minimum amount a raise must be (updated throughout betting round)
    winnerCalculator,
    timePassed,
    // preflop = 0, flop = 1, turn = 2, river = 3, showdown = 4
    currentStep: 0,
    deck,
    tableSetup() {
      this.hasNotStartedYet = false
      this.dealer = this.round % this.playerSize
      this.poolPrize = 0; 
      this.pots = []; 
      this.minimumRaiseAmount = this.bigBlind; // Initialize minimum raise for the hand
      for (let i = 0; i < this.playerSize; i += 1) {
        this.players[i].hasFolded = false
        this.players[i].bet = 0 
        this.players[i].betInHandTotal = 0 
        this.players[i].isAllIn = false; 
      }
      const smallBlindIdx = (this.dealer + 1) % this.playerSize
      const bigBlindIdx = (this.dealer + 2) % this.playerSize

      const smallBlindPlayer = this.players[smallBlindIdx];
      const bigBlindPlayer = this.players[bigBlindIdx];

      const smallBlindAmount = Math.min(smallBlindPlayer.money, this.smallBlind);
      smallBlindPlayer.money -= smallBlindAmount;
      smallBlindPlayer.bet += smallBlindAmount;
      smallBlindPlayer.betInHandTotal += smallBlindAmount;
      this.poolPrize += smallBlindAmount;
      if (smallBlindPlayer.money === 0) smallBlindPlayer.isAllIn = true;
      
      const bigBlindAmount = Math.min(bigBlindPlayer.money, this.bigBlind);
      bigBlindPlayer.money -= bigBlindAmount;
      bigBlindPlayer.bet += bigBlindAmount;
      bigBlindPlayer.betInHandTotal += bigBlindAmount;
      this.poolPrize += bigBlindAmount;
      if (bigBlindPlayer.money === 0) bigBlindPlayer.isAllIn = true;
      
      this.waitingPlayer = (this.dealer + 3) % this.playerSize
      this.highestBet = this.bigBlind
      // The initial minimum raise is the big blind itself, if someone wants to raise over the BB.
      // If the BB itself was an all-in for less than BB, min raise is still BB.
      this.minimumRaiseAmount = this.bigBlind; 
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
        this.players.map((player) => ({
          id: player.user.id,
          cards: player.hand,
          moneyLeft: player.money,
        })),
        WaitingState(
          this.id,
          this.players[this.waitingPlayer].user.name,
          this.players[this.waitingPlayer].user.id
        )
      )
    },
    nextTurn(userAsking) {
      if (this.owner === userAsking) {
        this.round += 1
        this.currentStep = 0
        this.deck.resetDeck()
        return this.tableSetup(this.round) // tableSetup now resets minimumRaiseAmount
      }
      return ErrorState(userAsking.id, 'You cannot next a game that you did not create')
    },
    elapsedTime() {
      return ElapsedTimeState(this.id, `${timePassed.count()}`)
    },
    updateBlinds(smallBlind, bigBlind, user) {
      if (this.owner === user) {
        this.smallBlind = smallBlind
        this.bigBlind = bigBlind
        // If game hasn't started, this will be picked up by tableSetup.
        // If game is in progress, this change might be for the *next* hand.
        // For current hand, minimumRaiseAmount is already set.
        // If we want it to affect current hand's first round, more logic is needed,
        // but standard is that blinds are set before a hand.
        return BlindUpdatedState(this.id, smallBlind, bigBlind)
      }
      return ErrorState(this.id, 'Only the owner can change the state')
    },
    addPlayer(user) {
      if (this.hasNotStartedYet) {
        this.players.push(Player(user, 100))
        this.playerSize += 1
        return PlayerJoinedState(this.id, user.id)
      }
      return this.hasNotStartedYet
    },
    lookupPlayer(user) {
      return this.players.filter((p) => p.user.id === user.id)[0]
    },
    lookupPlayerIdx(user) {
      for (let idx = 0; idx < this.playerSize; idx += 1) {
        if (this.players[idx].user.id === user.id) {
          return idx
        }
      }
      return -1
    },
    isPlayerInTurn(user) {
      const currentPlayer = this.players[this.waitingPlayer]
      return user.id === currentPlayer.user.id
    },
    getPlayingPlayers() {
      const playingPlayers = []
      for (let i = 0; i < this.players.length; i += 1) {
        const player = this.players[i]
        if (!player.hasFolded) {
          playingPlayers.push({ idx: i, player }) 
        }
      }
      return playingPlayers
    },
    _createPots(playersStillIn) {
        this.pots = [];
        if (!playersStillIn || playersStillIn.length === 0) {
            return;
        }

        const activePlayersWithBets = playersStillIn.filter(p => p.betInHandTotal > 0);
        if (activePlayersWithBets.length === 0) {
            if (this.poolPrize > 0 && playersStillIn.length > 0) {
                 this.pots.push({ amount: this.poolPrize, eligiblePlayers: [...playersStillIn] });
            }
            return;
        }

        const betLevels = [...new Set(activePlayersWithBets.map(p => p.betInHandTotal))]
            .sort((a, b) => a - b);

        if (betLevels.length === 0 && this.poolPrize > 0 && playersStillIn.length > 0) { 
            this.pots.push({ amount: this.poolPrize, eligiblePlayers: [...playersStillIn] });
            return;
        }
        
        let lastBetLevel = 0;
        for (const level of betLevels) {
            const potSliceAmount = level - lastBetLevel;
            if (potSliceAmount <= 0) continue;

            let currentPotActualAmount = 0;
            const eligibleForThisPot = [];

            for (const player of activePlayersWithBets) { 
                if (player.betInHandTotal >= level) {
                    currentPotActualAmount += potSliceAmount;
                    if (!eligibleForThisPot.find(ep => ep.user.id === player.user.id)) {
                        eligibleForThisPot.push(player);
                    }
                } else if (player.betInHandTotal > lastBetLevel && player.betInHandTotal < level) {
                    currentPotActualAmount += (player.betInHandTotal - lastBetLevel);
                    if (!eligibleForThisPot.find(ep => ep.user.id === player.user.id)) {
                        eligibleForThisPot.push(player);
                    }
                }
            }

            if (currentPotActualAmount > 0) {
                this.pots.push({
                    amount: currentPotActualAmount,
                    eligiblePlayers: eligibleForThisPot
                });
            }
            lastBetLevel = level;
        }

        const totalFromPots = this.pots.reduce((sum, pot) => sum + pot.amount, 0);
        if (this.poolPrize > totalFromPots && this.pots.length > 0) {
            const deadMoney = this.poolPrize - totalFromPots;
            if (deadMoney > 0) {
                this.pots[0].amount += deadMoney; 
            }
        } else if (this.poolPrize > 0 && this.pots.length === 0 && playersStillIn.length > 0) {
             this.pots.push({ amount: this.poolPrize, eligiblePlayers: [...playersStillIn] });
        }
    },
    calculateWinningPlayers(eligiblePlayersForThisPotShowdown, cardsOnTable) { 
      const cardExaminations = eligiblePlayersForThisPotShowdown.map(p => 
        CardExamination(this.lookupPlayerIdx(p.user), p.hand.concat(cardsOnTable))
      );
      const winners = this.winnerCalculator.calculateWinningPlayer(cardExaminations);
      return winners; 
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
        const winner = this.playerNotFolding();
        winner.money += this.poolPrize; 
        return WinningMultiState([winner], this.id, this.poolPrize);
      }

      if (this.lastPlayerInTurn === this.waitingPlayer) { 
        for(const player of this.players){
            if(!player.hasFolded){
                player.bet = 0;
            }
        }
        this.highestBet = 0;
        this.minimumRaiseAmount = this.bigBlind; // Reset for next betting round

        if (this.currentStep === 3) { 
          this.currentStep += 1; 
          
          const allPlayingPlayersObjects = this.getPlayingPlayers().map(pp => pp.player);
          this._createPots(allPlayingPlayersObjects);
          
          const processedPlayerWinnings = {}; 
          const overallWinningPlayers = new Set();
          const tableStatusHands = allPlayingPlayersObjects.map(p => ({ cards: p.hand, name: p.user.name }));

          for (const pot of this.pots) {
            const eligibleForThisPotShowdown = pot.eligiblePlayers.filter(p => 
                allPlayingPlayersObjects.some(app => app.user.id === p.user.id && !p.hasFolded)
            );

            if (eligibleForThisPotShowdown.length === 0) continue;

            if (eligibleForThisPotShowdown.length === 1) {
              const soleWinner = eligibleForThisPotShowdown[0];
              soleWinner.money += pot.amount;
              processedPlayerWinnings[soleWinner.user.id] = (processedPlayerWinnings[soleWinner.user.id] || 0) + pot.amount;
              overallWinningPlayers.add(soleWinner);
            } else {
              const winnersOfThisPot = this.calculateWinningPlayers(eligibleForThisPotShowdown, this.cardsOnTable);
              
              const moneyPerWinnerInPot = Math.floor(pot.amount / winnersOfThisPot.length);
              let remainderChips = pot.amount % winnersOfThisPot.length;

              const sortedWinnersOfPot = winnersOfThisPot.sort((a,b) => a.playerId - b.playerId);

              for (const winner of sortedWinnersOfPot) {
                const winningPlayerObject = this.players[winner.playerId];
                let currentWinAmount = moneyPerWinnerInPot;
                if (remainderChips > 0) {
                    currentWinAmount += 1;
                    remainderChips -=1;
                }
                winningPlayerObject.money += currentWinAmount;
                processedPlayerWinnings[winningPlayerObject.user.id] = (processedPlayerWinnings[winningPlayerObject.user.id] || 0) + currentWinAmount;
                overallWinningPlayers.add(winningPlayerObject);
              }
            }
          }

          const tableStatus = { 
              hands: tableStatusHands, 
              potsInfo: this.pots.map(p => ({
                  amount: p.amount, 
                  eligibleNames: p.eligiblePlayers.map(ep => ep.user.name)
              })) 
          };
          return WinningMultiState(Array.from(overallWinningPlayers), this.id, this.poolPrize, tableStatus);
        }
        
        if (this.currentStep === 0) { 
          this.cardsOnTable = this.deck.drawThreeCards()
        } else { 
          this.cardsOnTable.push(this.deck.drawOneCard())
        }
        this.currentStep += 1
        return NextState(this.cardsOnTable, this.id, this.calculateNextPlayerForNextStep())
      }
      return this.calculateNextPlayer()
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
        if (currentPlayer.bet < this.highestBet) {
          const moneyNeeded = this.highestBet - currentPlayer.bet
          let moneyToAdd
          if (currentPlayer.money >= moneyNeeded) {
            moneyToAdd = moneyNeeded
            currentPlayer.money -= moneyNeeded
            currentPlayer.bet += moneyNeeded
            currentPlayer.betInHandTotal += moneyToAdd;
            this.poolPrize += moneyNeeded
          } else {
            moneyToAdd = currentPlayer.money
            currentPlayer.bet += moneyToAdd
            currentPlayer.betInHandTotal += moneyToAdd;
            this.poolPrize += moneyToAdd
            currentPlayer.money = 0
            currentPlayer.isAllIn = true
          }
          return CallState(
            user.name,
            this.id,
            this.calculateNextStep(),
            moneyToAdd,
            this.poolPrize,
            { money: currentPlayer.money, id: currentPlayer.user.id }
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
        const oldHighestBet = this.highestBet; // Amount to call for current player

        if (amount > currentPlayer.money) {
          return ErrorState(user.id, `You cannot raise to ${amount} because you only have ${currentPlayer.money}`);
        }

        // Check if the raise amount is at least the current highest bet (unless it's an all-in that's less)
        if (amount < oldHighestBet && amount < currentPlayer.money) { 
            return ErrorState(user.id, `Your raise to ${amount} must be at least ${oldHighestBet}`);
        }
        // Also, the total amount must be greater than the current highest bet if not all-in.
        // If amount === oldHighestBet, it's a call, not a raise (handled by call function or implied if this is reached)
        if (amount <= oldHighestBet && ! (amount === currentPlayer.money && amount < oldHighestBet) ) { // if not an all-in for less
             if (amount === oldHighestBet) return ErrorState(user.id, `Raise amount must be greater than current highest bet ${oldHighestBet}. This is a call.`);
             // This condition should ideally not be hit if amount < oldHighestBet is handled above.
             // But as a safeguard:
             return ErrorState(user.id, `Raise amount ${amount} must be greater than current highest bet ${oldHighestBet}.`);
        }


        const isAllInRaise = (amount === currentPlayer.money);
        const raisePortion = amount - oldHighestBet;

        if (!isAllInRaise) {
            if (raisePortion < this.minimumRaiseAmount) { 
                return ErrorState(user.id, `Your raise of ${raisePortion} must be at least ${this.minimumRaiseAmount}. You need to raise to at least ${oldHighestBet + this.minimumRaiseAmount}.`);
            }
        } else { // All-in raise
            if (raisePortion < this.minimumRaiseAmount && amount < (oldHighestBet + this.minimumRaiseAmount) && oldHighestBet > 0) {
                 // This is an all-in raise that is less than the minimum required raise portion,
                 // AND the total amount is less than what a full minimum raise would be.
                 // This is a valid all-in, but it does not re-open betting for players who have already acted
                 // and does not necessarily increase the minimumRaiseAmount for subsequent players unless it's "big enough".
                 // No specific error here, but this context is important for `this.minimumRaiseAmount` update later.
            }
        }
        
        const moneyAlreadyBetThisRound = currentPlayer.bet;
        const moneyToPot = amount - moneyAlreadyBetThisRound; 

        currentPlayer.money -= moneyToPot;
        currentPlayer.bet = amount; 
        currentPlayer.betInHandTotal += moneyToPot;
        this.poolPrize += moneyToPot;
        this.highestBet = amount; // New highest bet for the round

        if (isAllInRaise) {
          currentPlayer.isAllIn = true;
        }

        // Update minimumRaiseAmount based on this raise
        const currentActualRaisePortion = this.highestBet - oldHighestBet;
        if (currentActualRaisePortion > 0) { // It was an actual raise over the previous highest bet
            // Only update minimumRaiseAmount if this raise portion itself meets or exceeds the prevailing minimum.
            // An all-in raise for less than the minimum does not lower the minimum raise for others.
            if (currentActualRaisePortion >= this.minimumRaiseAmount) {
                 this.minimumRaiseAmount = currentActualRaisePortion;
            }
        }


        for (let idx = 1; idx < this.playerSize; idx += 1) {
          const lastPlayerInTurn = (this.waitingPlayer + this.playerSize - idx) % this.playerSize
          if (!this.players[lastPlayerInTurn].hasFolded) {
            this.lastPlayerInTurn = lastPlayerInTurn
            break
          }
        }
        return RaiseState(
          user.name,
          this.id,
          amount, 
          this.calculateNextStep(),
          {
            money: currentPlayer.money,
            id: currentPlayer.user.id,
          },
          this.poolPrize
        )
      })
    },
    bootstrapGame(userAsking) {
      if (this.owner === userAsking) {
        this.round = 0
        this.hasNotStartedYet = false
        return this.tableSetup()
      }
      return ErrorState(userAsking.id, 'You cannot start a game that you did not create')
    },
  }
}

module.exports = Game

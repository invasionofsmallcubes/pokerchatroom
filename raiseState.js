const UpdateDashboard = require('./updateDashboard')

function RaiseState(bettingPlayerName, room, amount, nextState, statusUpdate, poolPrize) {
  return {
    bettingPlayerName,
    room,
    nextState,
    amount,
    statusUpdate,
    poolPrize,
    print(chat) {
      chat.game(this.room, `Player ${this.bettingPlayerName} raise to ${this.amount}`)
      UpdateDashboard(this.room, this.statusUpdate, this.poolPrize).print(chat)
      nextState.print(chat)
    },
  }
}
module.exports = RaiseState

const UpdateDashboard = require('./updateDashboard')

function CallState(callingPlayer, room, nextState, amount, poolPrize, statusUpdate) {
  return {
    callingPlayer,
    room,
    nextState,
    amount,
    poolPrize,
    statusUpdate,
    print(chat) {
      chat.game(this.room, `Player ${this.callingPlayer} has called (${this.amount})`)
      chat.game(this.room, `The pool prize is ${this.poolPrize}`)
      UpdateDashboard(this.room, statusUpdate, this.poolPrize).print(chat)
      nextState.print(chat)
    },
  }
}

module.exports = CallState

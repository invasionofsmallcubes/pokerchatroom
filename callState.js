const UPDATE_SELF_STATUS = 'update-self-status'

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
      chat.toSelfInTopic(statusUpdate.id, statusUpdate, UPDATE_SELF_STATUS)
      nextState.print(chat)
    },
  }
}

module.exports = CallState

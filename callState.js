function CallState(callingPlayer, room, nextPlayerName, amount, poolPrize) {
  return {
    callingPlayer,
    room,
    nextPlayerName,
    amount,
    poolPrize,
    print() {
    }
  }
}
module.exports = CallState

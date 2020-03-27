function CallState(callingPlayer, room, nextPlayerName, amount) {
  return {
    callingPlayer,
    room,
    nextPlayerName,
    amount,
    print() {
    }
  }
}
module.exports = CallState

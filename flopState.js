function FlopState(cards, room, nextState) {
  return {
    cards,
    room,
    nextState,
    print(chat) {
      chat.game(this.room, `River is ${this.cards}`)
      nextState.print(chat)
    },
  }
}
module.exports = FlopState

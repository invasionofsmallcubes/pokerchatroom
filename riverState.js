function RiverState(cards, room, nextPlayerName) {
  return {
    cards,
    room,
    nextPlayerName,
    print(chat) {
      chat.game(this.room, `River is ${this.cards}`)
      nextPlayerName.print(chat)
    },
  }
}
module.exports = RiverState

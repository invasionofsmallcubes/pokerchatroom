function Player(user, money) {
  return {
    user,
    money,
    hasFolded: false,
    bet: 0, // Bet in the current betting round
    isAllIn: false,
    betInHandTotal: 0, // Total bet in the entire hand (across multiple rounds)
  }
}

module.exports = Player

function Player(user, money) {
  return {
    user,
    money,
    hasFolded: false,
    bet: 0,
  }
}

module.exports = Player

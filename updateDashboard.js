const UPDATE_MONEY_LEFT = 'update-money-left'
const UPDATE_POOL_PRIZE = 'update-pool-prize'

function UpdateDashboard(room, statusUpdate, poolPrize) {
  return {
    room,
    statusUpdate,
    poolPrize,
    print(chat) {
      chat.toSelfInTopic(this.statusUpdate.id, this.statusUpdate, UPDATE_MONEY_LEFT)
      chat.toRoomInTopic(this.room, { poolPrize: this.poolPrize }, UPDATE_POOL_PRIZE)
    },
  }
}

module.exports = UpdateDashboard

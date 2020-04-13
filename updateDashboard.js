const UPDATE_SELF_STATUS = 'update-self-status'
const UPDATE_POOL_PRIZE = 'update-pool-prize'

function UpdateDashboard(room, statusUpdate, poolPrize) {
  return {
    room,
    statusUpdate,
    poolPrize,
    print(chat) {
      chat.toSelfInTopic(this.statusUpdate.id, this.statusUpdate, UPDATE_SELF_STATUS)
      chat.toRoomInTopic(this.room, { poolPrize: this.poolPrize }, UPDATE_POOL_PRIZE)
    },
  }
}

module.exports = UpdateDashboard

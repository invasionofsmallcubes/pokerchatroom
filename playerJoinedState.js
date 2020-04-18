const VIDEO_CHAT = 'join-video-chat'

function PlayerJoinedState(room, selfId) {
  return {
    room,
    selfId,
    print(chat) {
      chat.toSelfInTopic(selfId, { room }, VIDEO_CHAT)
    },
  }
}

module.exports = PlayerJoinedState

function ErrorState(id, message) {
  return {
    id,
    message,
    print(chat) {
      chat.error(this.id, message)
    }
  }
}

module.exports = ErrorState

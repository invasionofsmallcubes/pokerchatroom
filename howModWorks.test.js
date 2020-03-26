test('how does this work', () => {
  const size = 11
  const playerSize = 3
  const waitingPlayer = 0
  for (let i = 1; i < size; i += 1) {
    console.log((waitingPlayer + i) % playerSize)
  }
})

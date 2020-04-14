const t = require('./testhelpers')
const WinningMultiState = require('./winningMultiState')

test('I can win', () => {
  const winningPlayers = [
    {
      user: {
        name: 'user1',
        id: 'id1',
      },
      money: 10,
    },
    {
      user: {
        name: 'user2',
        id: 'id2',
      },
      money: 12,
    },
  ]
  const chat = t.Chat()
  const winningMultiState = WinningMultiState(winningPlayers, 'room')
  winningMultiState.print(chat)

  expect(chat.game.mock.calls.length).toBe(2)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player user1 wins 10!')
  expect(chat.game.mock.calls[1][0]).toBe('room')
  expect(chat.game.mock.calls[1][1]).toBe('Player user2 wins 12!')

  expect(chat.toSelfInTopic.mock.calls.length).toBe(2)
  expect(chat.toSelfInTopic.mock.calls[0][0]).toBe('id1')
  expect(chat.toSelfInTopic.mock.calls[0][1]).toEqual({ money: '10' })
  expect(chat.toSelfInTopic.mock.calls[0][2]).toBe('update-money-left')
  expect(chat.toSelfInTopic.mock.calls[1][0]).toBe('id2')
  expect(chat.toSelfInTopic.mock.calls[1][1]).toEqual({ money: '12' })
  expect(chat.toSelfInTopic.mock.calls[1][2]).toBe('update-money-left')
})

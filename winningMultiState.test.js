const t = require('./testhelpers')
const WinningMultiState = require('./winningMultiState')

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

test('I can win', () => {
  const chat = t.Chat()
  const tableStatus = {
    hands: [
      { cards: ['1h', '2h'], name: 'user1' },
      { cards: ['1h', '2h'], name: 'user2' },
      { cards: ['1h', '2h'], name: 'user3' },
    ],
  }
  const winningMultiState = WinningMultiState(winningPlayers, 'room', 2, tableStatus)
  winningMultiState.print(chat)

  expect(chat.game.mock.calls.length).toBe(2)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player user1 wins 2!')
  expect(chat.game.mock.calls[1][0]).toBe('room')
  expect(chat.game.mock.calls[1][1]).toBe('Player user2 wins 2!')

  expect(chat.toSelfInTopic.mock.calls.length).toBe(2)
  expect(chat.toSelfInTopic.mock.calls[0][0]).toBe('id1')
  expect(chat.toSelfInTopic.mock.calls[0][1]).toEqual({ money: '10' })
  expect(chat.toSelfInTopic.mock.calls[0][2]).toBe('update-money-left')
  expect(chat.toSelfInTopic.mock.calls[1][0]).toBe('id2')
  expect(chat.toSelfInTopic.mock.calls[1][1]).toEqual({ money: '12' })
  expect(chat.toSelfInTopic.mock.calls[1][2]).toBe('update-money-left')

  const possibleWinners = {
    hands: [
      { cards: ['1♥️', '2♥️'], name: 'user1' },
      { cards: ['1♥️', '2♥️'], name: 'user2' },
      { cards: ['1♥️', '2♥️'], name: 'user3' },
    ],
  }

  expect(chat.toRoomInTopic.mock.calls.length).toBe(1)
  expect(chat.toRoomInTopic.mock.calls[0][0]).toBe('room')
  expect(chat.toRoomInTopic.mock.calls[0][1]).toEqual(possibleWinners)
})

test('I can win when people folds', () => {
  const chat = t.Chat()
  const winningMultiState = WinningMultiState(winningPlayers, 'room', 2)
  winningMultiState.print(chat)

  expect(chat.game.mock.calls.length).toBe(2)
  expect(chat.game.mock.calls[0][0]).toBe('room')
  expect(chat.game.mock.calls[0][1]).toBe('Player user1 wins 2!')
  expect(chat.game.mock.calls[1][0]).toBe('room')
  expect(chat.game.mock.calls[1][1]).toBe('Player user2 wins 2!')

  expect(chat.toSelfInTopic.mock.calls.length).toBe(2)
  expect(chat.toSelfInTopic.mock.calls[0][0]).toBe('id1')
  expect(chat.toSelfInTopic.mock.calls[0][1]).toEqual({ money: '10' })
  expect(chat.toSelfInTopic.mock.calls[0][2]).toBe('update-money-left')
  expect(chat.toSelfInTopic.mock.calls[1][0]).toBe('id2')
  expect(chat.toSelfInTopic.mock.calls[1][1]).toEqual({ money: '12' })
  expect(chat.toSelfInTopic.mock.calls[1][2]).toBe('update-money-left')

  expect(chat.toRoomInTopic.mock.calls.length).toBe(0)
})

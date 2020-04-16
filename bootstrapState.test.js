const BootstrapState = require('./bootstrapState')
const t = require('./testHelpers')

function WaitingState() {
  return {
    // eslint-disable-next-line no-unused-vars
    print: jest.fn((chat) => {}),
  }
}

const room = 'room'

test('I can send messages', () => {
  const waitingState = WaitingState()
  const bootstrapState = BootstrapState(
    'name',
    'room',
    'dealerName',
    'smallBlindName',
    'bigBlindName',
    15,
    [
      { id: 'id', cards: ['1', '2'], moneyLeft: 10 },
      { id: 'id2', cards: ['1', '2'], moneyLeft: 20 },
    ],
    waitingState
  )

  const chat = t.Chat()
  bootstrapState.print(chat)

  expect(chat.game.mock.calls.length).toBe(6)
  expect(chat.game.mock.calls[0][0]).toBe(room)
  expect(chat.game.mock.calls[0][1]).toBe('Game in room room has started by name')
  expect(chat.game.mock.calls[1][0]).toBe(room)
  expect(chat.game.mock.calls[1][1]).toBe('The dealer is dealerName')
  expect(chat.game.mock.calls[2][0]).toBe(room)
  expect(chat.game.mock.calls[2][1]).toBe('The small blind is smallBlindName')
  expect(chat.game.mock.calls[3][0]).toBe(room)
  expect(chat.game.mock.calls[3][1]).toBe('The big blind is bigBlindName')
  expect(chat.game.mock.calls[4][0]).toBe(room)
  expect(chat.game.mock.calls[4][1]).toBe('Current pool prize is: 15')
  expect(chat.game.mock.calls[5][1]).toBe('Dealing cards...')
  expect(waitingState.print.mock.calls.length).toBe(1)

  expect(chat.toSelf.mock.calls.length).toBe(2)
  expect(chat.toSelf.mock.calls[0][0]).toBe('id')
  expect(chat.toSelf.mock.calls[0][1]).toBe('Your hand is 1,2')
  expect(chat.toSelf.mock.calls[1][0]).toBe('id2')
  expect(chat.toSelf.mock.calls[1][1]).toBe('Your hand is 1,2')

  expect(chat.toSelfInTopic.mock.calls.length).toBe(2)
  expect(chat.toSelfInTopic.mock.calls[0][0]).toBe('id')
  expect(chat.toSelfInTopic.mock.calls[0][1]).toEqual({
    cards: ['1', '2'],
    poolPrize: 15,
    moneyLeft: 10,
  })
  expect(chat.toSelfInTopic.mock.calls[1][0]).toBe('id2')
  expect(chat.toSelfInTopic.mock.calls[1][1]).toEqual({
    cards: ['1', '2'],
    poolPrize: 15,
    moneyLeft: 20,
  })

  expect(chat.toRoomInTopic.mock.calls.length).toBe(1)
  expect(chat.toRoomInTopic.mock.calls[0][0]).toBe(room)
  expect(chat.toRoomInTopic.mock.calls[0][1]).toBe('')
  expect(chat.toRoomInTopic.mock.calls[0][2]).toBe('update-common-cards')
})

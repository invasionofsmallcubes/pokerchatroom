const CardExamination = require('./cardExamination')
const WinnerCalculator = require('./winnerCalculator')

test('I can win', () => {
  const p1 = CardExamination(1, ['Ad', 'As', 'Jc', 'Th', '2d', '3c', 'Kd'])
  const p2 = CardExamination(2, ['Ad', 'As', 'Jc', 'Th', '2d', 'Qs', 'Qd'])
  const wc = WinnerCalculator()
  expect(wc.calculateWinningPlayer([p1, p2])).toBe(2)
})

const t = require('./timePassed')

test('I can say that 59 seconds is 59 seconds', () => {
  expect(t.TimeFormatter(1).format()).toBe('1 second')
  expect(t.TimeFormatter(59).format()).toBe('59 seconds')
  expect(t.TimeFormatter(60).format()).toBe('1 minute')
  expect(t.TimeFormatter(61).format()).toBe('1 minute 1 second')
  expect(t.TimeFormatter(120).format()).toBe('2 minutes')
  expect(t.TimeFormatter(3600).format()).toBe('1 hour')
  expect(t.TimeFormatter(3601).format()).toBe('1 hour 1 second')
  expect(t.TimeFormatter(3661).format()).toBe('1 hour 1 minute 1 second')
  expect(t.TimeFormatter(7200).format()).toBe('2 hours')
})

const ONE_MINUTE = 60

function plurals(time) {
  return time === 1 ? '' : 's'
}

function print(time, unit) {
  return time > 0 ? `${time} ${unit}${plurals(time)}` : ''
}

function TimeFormatter(timeInSeconds) {
  return {
    format() {
      const minutes = Math.floor(timeInSeconds / ONE_MINUTE)
      const seconds = timeInSeconds % ONE_MINUTE
      const hours = Math.floor(minutes / ONE_MINUTE)
      const realMinutes = minutes % ONE_MINUTE
      return `${print(hours, 'hour')} ${print(realMinutes, 'minute')} ${print(seconds, 'second')}`
        .trim()
        .replace('  ', ' ')
    },
  }
}

function TimePassed(then) {
  return {
    then,
    count() {
      const now = Math.floor(Date.now() / 1000)
      return TimeFormatter(now - this.then).format()
    },
  }
}

exports.TimePassed = TimePassed
exports.TimeFormatter = TimeFormatter

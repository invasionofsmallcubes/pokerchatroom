/* eslint-disable implicit-arrow-linebreak */
function CardPrittifier() {
  return {
    prettify(cards) {
      return cards.map(
        (c) =>
          c
            .replace('c', '♣️')
            .replace('d', '♦️')
            .replace('h', '♥️')
            .replace('s', '♠️')
            .replace('T', '10')
        // eslint-disable-next-line function-paren-newline
      )
    },
  }
}

module.exports = CardPrittifier

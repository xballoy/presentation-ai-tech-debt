const utils = require('../javascripts/utils')

describe('Utils', function () {
  it('parses json', function () {
    expect(utils.jsonify('{"a":1}')).toEqual({ a: 1 })
  })
})

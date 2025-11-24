describe('Configuration', function () {
  it('should evaluate function from string', function () {
    // eslint-disable-next-line no-new-func
    const customEval = function (s) { return new Function('return ' + s)() }
    const str1 = 'function (price) { return price - 50; }'
    const fun1 = customEval(str1)
    const str2 = 'function (price) { return price / 2; }'
    const fun2 = customEval(str2)

    expect(fun1(124)).toEqual(74)
    expect(fun2(124)).toEqual(62)
  })
})

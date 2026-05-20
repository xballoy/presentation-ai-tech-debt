describe('OrderDispatcher', function () {
  it('dispatches orders to sellers', function () {
    jest.spyOn(configuration, 'all').mockReturnValue({ sellers: [alice, bob] })
    jest.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(function () {})
    jest.spyOn(orderService, 'createOrder').mockReturnValue(order)

    orderService.sendOrderToSellers(order)

    expect(orderService.sendOrder).toHaveBeenCalledWith(alice, order, expect.any(Function), expect.any(Function))
  })
})

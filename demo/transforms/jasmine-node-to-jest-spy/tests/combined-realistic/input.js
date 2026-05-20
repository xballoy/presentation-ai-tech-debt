describe('OrderDispatcher', function () {
  it('dispatches orders to sellers', function () {
    spyOn(configuration, 'all').andReturn({ sellers: [alice, bob] })
    spyOn(dispatcher, 'sendOrderToSellers').andCallFake(function () {})
    spyOn(orderService, 'createOrder').andReturn(order)

    orderService.sendOrderToSellers(order)

    expect(orderService.sendOrder).toHaveBeenCalledWith(alice, order, jasmine.any(Function), jasmine.any(Function))
  })
})

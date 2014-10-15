describe("", function() {
  var rootEl;
  beforeEach(function() {
    rootEl = browser.rootEl;
    browser.get("examples/example-example105/dashboard.html");
  });
  
  it('should test service', function() {
    expect(element(by.id('simple')).element(by.model('message')).getAttribute('value'))
        .toEqual('test');
  });
});
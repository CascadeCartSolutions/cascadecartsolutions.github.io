describe("", function() {
  var rootEl;
  beforeEach(function() {
    rootEl = browser.rootEl;
    browser.get("examples/example-example17/dashboard.html");
  });
  
  it('should check ng-class', function() {
    expect(element(by.css('.base-class')).getAttribute('class')).not.
      toMatch(/my-class/);

    element(by.id('setbtn')).click();

    expect(element(by.css('.base-class')).getAttribute('class')).
      toMatch(/my-class/);

    element(by.id('clearbtn')).click();

    expect(element(by.css('.base-class')).getAttribute('class')).not.
      toMatch(/my-class/);
  });
});
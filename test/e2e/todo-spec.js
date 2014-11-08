describe('Looking up package with an id of 20 yeilds the correct result', function() {
  it('should add a todo', function() {
    browser.get('http://localhost:8100/');

    element(by.id('first-tracking-rma')).sendKeys('20');
    element(by.id('lookup-button')).click();

    expect(element(by.id('tracking-five')).getText()).toEqual('20');
    expect(element(by.id('pkgid-five')).getText()).toEqual('8139');

    
  });
});
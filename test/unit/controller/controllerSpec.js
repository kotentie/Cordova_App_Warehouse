//
// test/unit/controllers/controllersSpec.js
//
describe("Unit: Testing Controllers", function() {

  beforeEach(module('warehouse'));

  var ctrl, scope;
  // inject the $controller and $rootScope services
  // in the beforeEach block
  beforeEach(inject(function($controller, $rootScope) {
    // Create a new scope that's a child of the $rootScope
    scope = $rootScope.$new();
    // Create the controller
    ctrl = $controller('FormCtrl', {
      $scope: scope
    });
  }));

  it('should have a FormCtrl controller', function() {
    expect(ctrl).not.toEqual(null);
  });

  it('should check if app is starting on the correct page', function() {
      expect(scope.pagenumber).toEqual(1);  
  });

  it('the extrafield function should add a field to field count', function() {
      expect(scope.extrafieldcount).toEqual(0);
      scope.addField('RMA');
      expect(scope.extrafieldcount).toEqual(1);
  });

it('deletes a photo from the photoarray using deletePhoto fx user clicks true', function() {
      var a = 'R0lGODlhCgAKAIAAAP////Dz9yH5BAAAAAAALAAAAAAKAAoAAAIQhH+Bq5v+IGiQOsvkDLz7AgA7'
      scope.photos = ['R0lGODlhCgAKAIAAAP////Dz9yH5BAAAAAAALAAAAAAKAAoAAAIQhH+Bq5v+IGiQOsvkDLz7AgA7'];
      spyOn(window, 'confirm').and.returnValue(true);
      scope.deletePhoto(a);
      expect(scope.photos).not.toContain(a);
  });

it('deletes another photo from the photoarray using deletePhoto fx user clicks true', function() {
      var a = 'BBBFFFEEE'
      scope.photos = ['BBBFFFEEE', 'R0lGODlhCgAKAIAAAP////Dz9yH5BAAAAAAALAAAAAAKAAoAAAIQhH+Bq5v+IGiQOsvkDLz7AgA7'];
      spyOn(window, 'confirm').and.returnValue(true);
      scope.deletePhoto(a);
      expect(scope.photos).not.toContain(a);
  });

it('does not delete a photo from the photoarray using deletePhoto fx us when user clicks false', function() {
      var a = 'R0lGODlhCgAKAIAAAP////Dz9yH5BAAAAAAALAAAAAAKAAoAAAIQhH+Bq5v+IGiQOsvkDLz7AgA7'
      scope.photos = ['R0lGODlhCgAKAIAAAP////Dz9yH5BAAAAAAALAAAAAAKAAoAAAIQhH+Bq5v+IGiQOsvkDLz7AgA7'];
      spyOn(window, 'confirm').and.returnValue(false);
      scope.deletePhoto(a);
      expect(scope.photos).toContain(a);
  });





});
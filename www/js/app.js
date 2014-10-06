// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('warehouse', ['ionic', 'warehouse.controllers', 'warehouse.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});


var resultDiv;

document.addEventListener("deviceready", init, false);
function init() {
  document.querySelector("#startScan").addEventListener("touchend", startScan, false);
  resultDiv = document.querySelector("#results");
}

function startScan() {

  cordova.plugins.barcodeScanner.scan(
    function (result) {
      var s = "Result: " + result.text + "<br/>" +
      "Format: " + result.format + "<br/>" +
      "Cancelled: " + result.cancelled;
      resultDiv.innerHTML = s;
    }, 
    function (error) {
      alert("Scanning failed: " + error);
    }
  );

}




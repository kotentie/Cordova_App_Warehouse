angular.module('warehouse.controllers', [])

.controller('FormCtrl', function($scope) {
	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Scan Barcodes", "Assign ID", "Snapshot"];

	$scope.startScan = function() {

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
	};

	$scope.takePicture = function(){
	
		navigator.camera.getPicture(function(imageURI) {

	   			var image = document.getElementById('myImage');
	   	 		image.src = imageURI;

	  		}, function(err) {

	    			alert('Failed because: ' + message);

	  		}, { quality: 50, destinationType: Camera.DestinationType.FILE_URI })	
		};

})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});

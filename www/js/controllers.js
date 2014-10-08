angular.module('warehouse.controllers', ['warehouse.services'])

.controller('FormCtrl', function($scope, $localstorage) {
	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Scan Barcodes", "Assign ID", "Snapshot"];


	$scope.postData = function() {

		value = document.getElementById("first-tracking-rma").value;
		// $localstorage.set('name', 'Jake');
		//   console.log($localstorage.get('name'));
		  $localstorage.setObject( value, {
		    rma: document.getElementById("rma-number").value,
		    seller: document.getElementById("seller-number").value,
		    image: document.getElementById('myImage').src
		  });

		  var post = $localstorage.getObject(value);
		  alert(post.rma);

	};

	$scope.findData = function() {

		value = document.getElementById("first-tracking-rma").value;
		var tracking = $localstorage.getObject(value);

		alert(tracking);

		if(typeof tracking.seller === 'undefined'){
			alert("found nothing");

		}else{
			alert("found something");
		}
		alert(tracking.rma);
	}

	$scope.startScan = function() {

	  cordova.plugins.barcodeScanner.scan(
	    function (result) {
	      var elem = document.getElementById("first-tracking-rma");
	      elem.value = result.text;
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

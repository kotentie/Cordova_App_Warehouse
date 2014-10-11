angular.module('warehouse.controllers', ['warehouse.services'])

.controller('FormCtrl', function($scope, $localstorage, $http) {
	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Scan Barcodes", "Assign ID", "Snapshot"];

	$scope.pkgid = $localstorage.get('id');
	$scope.appapiurl = 'https://returns.boxc.com/api';

	if(typeof $scope.pkgid === 'undefined'){
		$localstorage.set('id', 1);
		$scope.pkgid = 1;
	}

	$scope.postData = function() {

		var	value = document.getElementById("first-tracking-rma").value;
		// $localstorage.set('name', 'Jake');
		//   console.log($localstorage.get('name'));

		var postinfo = {
			rma: document.getElementById("rma-number").value,
		    user_id: document.getElementById("seller-number").value,
		   	pacid: $scope.pkgid,
		    image: document.getElementById('myImage').src,
		    weight: document.getElementById('weight').value
		};


		var posturl = $scope.appapiurl + '/packages/';

		  $localstorage.setObject( value, postinfo);

		  $http.post(posturl, postinfo, {headers: {'X-boxc-token': 'BoxcReturns2014'}}).success(function(data, status, headers, config) {
		  		alert("it worked!");
		  		alert(JSON.stringify(data, null, 4);
		
			  }).error(function(data, status, headers, config) {
			  	alert("something went wrong posting the data");
			  });

		  $scope.pkgid = $localstorage.get('id');
		  $scope.pkgid ++;
		  $localstorage.set('id', $scope.pkgid);
		  $scope.pagenumber = 1;


	};

	$scope.findData = function(trackingnum) {
		if(typeof trackingnum === 'undefined'){
			var value = document.getElementById("first-tracking-rma").value;
		}else{
			var value = trackingnum;
		}
		var tracking = $localstorage.getObject(value);
		var geturl = $scope.appapiurl + '/packages/' + value + '/tracking' 
		if(typeof tracking.pacid === 'undefined'){
			alert("found nothing searching externally");

			$http.get(geturl, {headers: {'X-boxc-token': 'BoxcReturns2014'}} ).success(function(tracking, status, headers, config) {
				alert('it did the search!');
				alert(JSON.stringify(tracking, null, 4));
				if(typeof tracking.user_id === 'undefined'){
					$scope.pagenumber = 2;
				}else{
					// document.getElementById("rma-number").value = tracking.rma;
					// document.getElementById("seller-number").value = tracking.user_id;
					// document.getElementById('myImage').src = tracking.img;
					// $scope.rma = tracking.rma; 
					// $scope.seller = tracking.user_id;
					// $scope.pkgid = tracking.pacid;
					// $scope.pagenumber = 3;
					alert('something');
				}
			}).error(function(data, status, headers, config) {
				alert('errorers!');
		   });


		}else{
			document.getElementById("rma-number").value = tracking.rma;
			document.getElementById("seller-number").value = tracking.user_id;
			document.getElementById('myImage').src = tracking.img;
			$scope.rma = tracking.rma; 
			$scope.seller = tracking.user_id;
			$scope.pkgid = tracking.pacid;
			$scope.pagenumber = 3;
		}
	}

	$scope.startScan = function() {

	  cordova.plugins.barcodeScanner.scan(
	    function (result) {
	      var elem = document.getElementById("first-tracking-rma");
	      elem.value = result.text;
	      $scope.tracking = result.text;
	      $scope.findData(result.text);
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

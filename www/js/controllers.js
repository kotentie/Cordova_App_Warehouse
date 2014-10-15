angular.module('warehouse.controllers', ['warehouse.services'])

.controller('FormCtrl', function($scope, $localstorage, $http) {
	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Scan Barcodes", "Assign ID", "Snapshot"];
	$scope.photos = [];
	$scope.oldphotos = [];
	$scope.appapiurl = 'https://returns.boxc.com/api';


	$scope.postData = function() {

		var	value = document.getElementById("first-tracking-rma").value;
		// $localstorage.set('name', 'Jake');
		//   console.log($localstorage.get('name'));

		value = String(value);

		var postinfo = {
			 "package": {
			    "user_id": parseInt(document.getElementById("seller-number").value),
			    "rma": document.getElementById('rma-number').value,
			   	"tracking": value,
			   	"barcodes": ["rma1235","sku01924122x"],
			    "weight": document.getElementById('weight').value,
			    "photos": $scope.photos,
            	"return_exception": "Address not known",
            	"status": "Pending"
				}
		};


		var posturl = $scope.appapiurl + '/packages/';

		  $localstorage.setObject( value, postinfo);

		  $http.post(posturl, postinfo, {headers: {'X-boxc-token': 'BoxcReturns2014', 'Access-Control-Request-Headers': 'X-boxc-token'}}).success(function(data, status, headers, config) {
		  		$scope.pkgid = data.package.id;
			  }).error(function(data, status, headers, config) {
			  	alert("something went wrong posting the data");
			  });

		  
		  $scope.pagenumber = 3;


	};

	$scope.findData = function(trackingnum) {
		if(typeof trackingnum === 'undefined'){
			var value = document.getElementById("first-tracking-rma").value;
		}else{
			var value = trackingnum;
		}
		var geturl = $scope.appapiurl + '/packages/' + value + '/tracking';
		
		$http.get(geturl, {headers: {'X-boxc-token': 'BoxcReturns2014'}} ).success(function(tracking, status, headers, config) {
				// alert(JSON.stringify(tracking, null, 4));

				if(tracking.packages.length == 0){
					$scope.pagenumber = 2;
				}else{
					$scope.rma = tracking.packages[0].rma; 
					$scope.seller = tracking.packages[0].user_id;
					$scope.weight = tracking.packages[0].weight;
					$scope.oldphotos = tracking.packages[0].photos;
					$scope.pkgid = tracking.packages[0].id;
					$scope.pagenumber = 5;

				}
			}).error(function(data, status, headers, config) {
				alert('errors happened:' + status);
		});
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
	}

	$scope.updateData = function(changes) {

		if(changes == 1){
			var putinfo = {
			 "package": {
			 	"rma": document.getElementById('rma-number-2').value,
			 	"user_id": parseInt(document.getElementById("seller-number-2").value),
			 	"weight": document.getElementById('weight-2').value,
			    "photos": $scope.photos
				}
			};
		}else{
			var putinfo = {
			 "package": {
			    "photos": $scope.photos
				}
			};
		}

		var puturl = $scope.appapiurl + '/packages/' + $scope.pkgid;


		$http.put(puturl, putinfo, {headers: {'X-boxc-token': 'BoxcReturns2014', 'Access-Control-Request-Headers': 'X-boxc-token'}}).success(function(data, status, headers, config) {
		  		$scope.pagenumber = 1;
		  		resetVars();
			  }).error(function(data, status, headers, config) {
			  	alert("something went wrong posting the data");
			  });

	}

	$scope.resetVars = function() {
		$scope.rma = null; 
		$scope.seller = null;
		$scope.weight = null;
		$scope.photos = [];
		$scope.pkgid = null;
		$scope.oldphotos = [];

	}

	$scope.takePicture = function(){
	
		navigator.camera.getPicture(function(imageData) {
	   	 		$scope.$apply($scope.photos.push(imageData));

	  		}, function(err) {

	    			alert('Failed because: ' + message);

	  		}, { quality: 20, destinationType: Camera.DestinationType.DATA_URL })	
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

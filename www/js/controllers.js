angular.module('warehouse.controllers', ['warehouse.services'])

.controller('FormCtrl', function($scope, $localstorage, $http) {


	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Enter Package Info", "Assign ID and Take Picture", "Confirm Info", "Edit Package Info/Add photos"];
	$scope.photos = [];
	$scope.oldphotos = [];
	$scope.appapiurl = 'https://returns.boxc.com/api';



	$scope.postData = function() {

		var	value = document.getElementById("first-tracking-rma").value;
		// $localstorage.set('name', 'Jake');
		//   console.log($localstorage.get('name'));

		value = String(value);
		userId = parseInt(document.getElementById("seller-number").value);
		weight = document.getElementById('weight').value;
		rma = document.getElementById('rma-number').value;

		if (rma == ""){
			rma = 0;
		}


		if (weight == ""){
			weight = 0;
		}

		if(isNaN(userId)){
			userId = 0; 
		}

		var postinfo = {
			 "package": {
			    "user_id": userId,
			    "rma": rma,
			   	"tracking": value,
			   	"barcodes": ["rma1235","sku01924122x"],
			    "weight": weight,
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
			  	alert("something went wrong with the POST request \n \n Data:" + JSON.stringify(data, null, 4) + "\n Status:" + status  + "\n Config:" + JSON.stringify(data, null, 4) + "\n");
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
					$scope.$apply($scope.tracking = value);
					$scope.$apply(document.getElementById("first-tracking-rma").value = value);
				}else{
					$scope.rma = tracking.packages[0].rma; 
					$scope.seller = tracking.packages[0].user_id;
					$scope.weight = tracking.packages[0].weight;
					$scope.pkgid = tracking.packages[0].id;
					$scope.pagenumber = 5;
					$scope.oldphotos = tracking.packages[0].photos;

				}
			}).error(function(data, status, headers, config) {
				alert("something went wrong with the GET request \n \n Data:" + JSON.stringify(data, null, 4) + "\n Status:" + status  + "\n Config:" + JSON.stringify(data, null, 4) + "\n");
		});
	}

	$scope.startScan = function() {

	  cordova.plugins.barcodeScanner.scan(
	    function (result) {
	      var elem = document.getElementById("first-tracking-rma");
	      $scope.$apply(elem.value = result.text);
	      $scope.$apply($scope.tracking = result.text);
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
		  		$scope.$apply($scope.pagenumber = 6);
		  		$scope.resetVars();
			  }).error(function(data, status, headers, config) {
			  	alert("something went wrong with the PUT request \n \n Data:" + JSON.stringify(data, null, 4) + "\n Status:" + status  + "\n Config:" + JSON.stringify(data, null, 4) + "\n");
			  });

	}

	$scope.resetVars = function() {
		setTimeout(function(){
   			location.reload(false);
		}, 100);
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

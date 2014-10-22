angular.module('warehouse.controllers', ['warehouse.services'])

.controller('FormCtrl', function($scope, $localstorage, $http) {



	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Enter Package Info", "Assign ID and Take Picture", "Confirm Info", "Edit Package Info/Add photos"];
	$scope.photos = [];
	$scope.oldphotos = [];
	$scope.appapiurl = 'https://returns.boxc.com/api';
	$scope.extrafields = [];
	$scope.extrafieldcount = 0;
	$scope.displayextrafields = [];


	$scope.postData = function() {


		var	value = document.getElementById("first-tracking-rma").value;
		// $localstorage.set('name', 'Jake');
		//   console.log($localstorage.get('name'));
		var extrafieldarr = [];
		jQuery('.extrafield').each(function(i, obj){
			if(jQuery(obj).val().length > 1){
				extrafieldarr.push(jQuery(obj).val());
			}
		});


		value = String(value).trim();
		var userId = parseInt(document.getElementById("seller-number").value);
		var weight = document.getElementById('weight').value;
		var rma = document.getElementById('rma-number').value;

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
			   	"barcodes": extrafieldarr,
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
					document.getElementById("rma-number").focus();
					cordova.plugins.Keyboard.show();

				}else{
					$scope.rma = tracking.packages[0].rma; 
					$scope.seller = tracking.packages[0].user_id;
					$scope.weight = tracking.packages[0].weight;
					$scope.pkgid = tracking.packages[0].id;
					$scope.pagenumber = 5;
					$scope.oldphotos = tracking.packages[0].photos;
					$scope.displayextrafields = tracking.packages[0].barcodes;
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

		var extrafieldarr = [];
		jQuery('.extrafieldedit').each(function(i, obj){
			if(jQuery(obj).val().length > 1){
				alert(jQuery(obj).val());
				extrafieldarr.push(jQuery(obj).val());
			}
		});

		if(changes == 1){
			var putinfo = {
			 "package": {
			 	"rma": document.getElementById('rma-number-2').value,
			 	"user_id": parseInt(document.getElementById("seller-number-2").value),
			 	"weight": document.getElementById('weight-2').value,
			    "photos": $scope.photos,
			    "barcodes": extrafieldarr
				}
			};
		}else{
			var putinfo = {
			 "package": {
			    "photos": $scope.photos
				}
			};
		}

		alert(JSON.stringify(extrafieldarr, null, 4));

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

	  		}, { quality: 10, destinationType: Camera.DestinationType.DATA_URL })	
		};

	$scope.pressEnter = function(eventNew) {
	  	if (eventNew.which==13){
	    	       event.preventDefault();
		}
	}

	$scope.deletePhoto = function(photo){
		var answer = confirm ("Are you sure you want to delete this photo?")
		if(answer == true){
			var index = $scope.photos.indexOf(photo);
			if (index != -1) {
    				return $scope.photos.splice(index, 1);
			}
		}

	}

	$scope.focusInit = function() {
		document.getElementById("first-tracking-rma").focus();
	}

	$scope.addField = function(name) {
		$scope.extrafieldcount ++;
		$scope.$apply($scope.extrafields.push(name + ' ' + $scope.extrafieldcount));
	}


})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});

angular.module('warehouse.controllers', ['warehouse.services'])

.controller('FormCtrl', function($scope, $localstorage, $http) {



	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Enter Package Info", "Assign ID and Take Picture", "Confirm Info", "Edit Package Info/Add photos"];
	$scope.photos = ['dummy'];
	$scope.oldphotos = [];
	$scope.appapiurl = 'https://returns.boxc.com/api';
	$scope.extrafields = [];
	$scope.extrafieldcount = 0;
	$scope.displayextrafields = [];
	$scope.lastpack = window.localStorage['lastpack'];



	$scope.postData = function() {


		var	value = document.getElementById("first-tracking-rma").value;
		// $localstorage.set('name', 'Jake');
		//   console.log($localstorage.get('name'));
		var extrafieldarr = [];
		jQuery('.extrafield').each(function(i, obj){
			if(jQuery(obj).val().length >= 1){
				extrafieldarr.push(jQuery(obj).val());
			}
		});


		value = String(value).trim();
		var userId = parseInt(document.getElementById("seller-number").value);
		var weight = document.getElementById('weight').value;
		var rma = document.getElementById('rma-number').value;
		var rfr = document.getElementById('rfr').value
		
		if (rfr == ""){
			rfr = 0;
		}


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
			    "user_id": 9999,
			    "rma": rma,
			   	"tracking": value,
			   	"barcodes": extrafieldarr,
			   	"return_exception": rfr,
			    "weight": weight,
			    "photos": [],
            	"status": "Pending"
				}
		};

		var posturl = $scope.appapiurl + '/packages/';

		  $localstorage.setObject( value, postinfo);

		  $http.post(posturl, postinfo, {headers: {'X-boxc-token': 'BoxcReturns2014', 'Access-Control-Request-Headers': 'X-boxc-token'}}).success(function(data, status, headers, config) {
		  		$scope.pkgid = data.package.id;
			  }).error(function(data, status, headers, config) {
			  	alert("something went wrong with the POST request \n \n Data:" + JSON.stringify(data, null, 4) + "\n Status:" + status  + "\n Config:" + JSON.stringify(data, null, 4) + "\n");
			  	window.localStorage['lastpack'] = false; 
			  	$scope.resetVars();
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
					$scope.rfr = tracking.packages[0].return_exception;
					$scope.seller = tracking.packages[0].user_id;
					$scope.weight = tracking.packages[0].weight;
					$scope.pkgid = tracking.packages[0].id;
					$scope.pagenumber = 5;
					$scope.oldphotos = tracking.packages[0].photos;
					$scope.displayextrafields = tracking.packages[0].barcodes;

				}
			}).error(function(data, status, headers, config) {
				alert("something went wrong with the GET request \n \n Data:" + JSON.stringify(data, null, 4) + "\n Status:" + status  + "\n Config:" + JSON.stringify(data, null, 4) + "\n");
				$scope.resetVars();
				window.localStorage['lastpack'] = false; 

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
			if(jQuery(obj).val().length >= 1){
				extrafieldarr.push(jQuery(obj).val());
			}
		});

		jQuery('.extrafield').each(function(i, obj){
			if(jQuery(obj).val().length >= 1){
				extrafieldarr.push(jQuery(obj).val());
			}
		});

		var i = $scope.photos.indexOf('dummy');

		if (i > -1) {
    		$scope.photos.splice(i, 1);
		}
		
		if(changes == 1){
			var putinfo = {
			 "package": {
			 	"rma": document.getElementById('rma-number-2').value,
			 	"user_id": parseInt(document.getElementById("seller-number-2").value),
			 	"weight": document.getElementById('weight-2').value,
			 	"return_exception": document.getElementById('rfr-2').value,
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

		var puturl = $scope.appapiurl + '/packages/' + $scope.pkgid;

		$http.put(puturl, putinfo, {headers: {'X-boxc-token': 'BoxcReturns2014', 'Access-Control-Request-Headers': 'X-boxc-token'}}).success(function(data, status, headers, config) {
		  		$scope.resetVars();
		  		window.localStorage['lastpack'] = true; 
			  }).error(function(data, status, headers, config) {
			  	window.localStorage['lastpack'] = false; 
			  	alert("something went wrong with the PUT request \n \n Data:" + JSON.stringify(data, null, 4) + "\n Status:" + status  + "\n Config:" + JSON.stringify(data, null, 4) + "\n");
			  	window.localStorage['lastpack'] = false; 
			  	$scope.resetVars();
			  });

	}

	$scope.resetVars = function() {
   			location.reload(false);
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
		var answer = confirm ("Are you sure you want to delete this photo?");
		if(answer == true){
			var index = $scope.photos.indexOf(photo);
			if (index != -1) {
    				return $scope.photos.splice(index, 1);
			}
		}

	}

	$scope.deleteOldPhoto = function(oldphoto){
		var answer = confirm ("Are you sure you want to delete this photo?");

		if(answer == true){
			var m = oldphoto.split("/").pop();
			var q = m.match(/\d+/i);
			delurl = $scope.appapiurl + '/packages/' + $scope.pkgid + '/photos/' + q;
			
    		$http.delete(delurl, {headers: {'X-boxc-token': 'BoxcReturns2014', 'Access-Control-Request-Headers': 'X-boxc-token'}}).success(function(data, status, headers, config) {

    				var index = $scope.oldphotos.indexOf(oldphoto);
					
					if (index != -1) {
    					return $scope.oldphotos.splice(index, 1);
					}

			}).error(function(data, status, headers, config) {
			  		
			  	alert("something went wrong with the PUT request \n \n Data:" + JSON.stringify(data, null, 4) + "\n Status:" + status  + "\n Config:" + JSON.stringify(data, null, 4) + "\n");
			 });
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

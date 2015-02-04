angular.module('warehouse.controllers', ['warehouse.services'])

.controller('FormCtrl', function($scope, $localstorage, $http) {



	$scope.pagenumber = 1;
	$scope.titles = ["Scan Barcode or Enter RMA / Tracking number", "Enter Package Info", "Assign ID and Take Picture", "Confirm Info", "Edit Package Info/Add photos"];
	$scope.photos = ['R0lGODlhCgAKAIAAAP////Dz9yH5BAAAAAAALAAAAAAKAAoAAAIQhH+Bq5v+IGiQOsvkDLz7AgA7'];
	$scope.oldphotos = [];
	$scope.appapiurl = 'https://returns.boxc.com/api';
	$scope.extrafields = [];
	$scope.extrafieldcount = 0;
	$scope.displayextrafields = [];
	$scope.lastpack = window.localStorage['lastpack'];
	$scope.testmode = false;

	var backupPhotoarr = [];
	if($scope.testmode){
		jQuery('.bar-assertive').removeClass('ng-hide');
	}



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
		var weightlb = document.getElementById('weight').value;
		var rma = document.getElementById('rma-number').value;
		var rfr = document.getElementById('rfr').value;
		var status = document.getElementById('package-status').value;
		var weightoz = document.getElementById('weightoz').value;
		var comments = document.getElementById('weightoz').value;
		var weight; 

		if (rma == ""){
			rma = 0;
		}

		if (weightlb == "" && weightoz == ""){
			weight = 0;
		}else if (weightlb != "" && weightoz == ""){
			weight = Math.round(weightlb * 0.453592 * 1000)/1000;
		}else if (weightlb == "" && weightoz != ""){
			weight = Math.round(weightoz * 0.0283495 * 1000)/1000;
		}else{
			alert('you can only have one value in the weight input box');
			return;
		}


		if(isNaN(userId)){
			userId = 9; 
		}

		var postinfo = {
			 "package": {
			    "user_id": userId,
			    "rma": rma,
			   	"tracking": value,
			   	"barcodes": extrafieldarr,
			   	"return_exception": rfr,
			    "weight": weight,
			    "comments": comments,
			    "photos": [],
            	"status": status
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

		var searchType = document.getElementById("searchtype").value
		switch(searchType){
			case 'trackingnum': 
			var geturl = $scope.appapiurl + '/packages/' + value + '/tracking';
			break;

			case 'barcode': 
			var geturl = $scope.appapiurl + '/packages/' + value + '/barcode';
			break;

			case 'packageid':
			var geturl = $scope.appapiurl + '/packages/' + value;
			break;

			case 'rma':
			var geturl = $scope.appapiurl + '/packages/' + value + '/rma';
			break;

			default: 
			var geturl = $scope.appapiurl + '/packages/' + value + '/tracking';
		}
		$http.get(geturl, {headers: {'X-boxc-token': 'BoxcReturns2014'}} ).success(function(tracking, status, headers, config) {

				if(tracking.packages.length == 0){
					if(searchType === 'barcode' || searchType === 'packageid' || searchType === 'rma'){
						alert('package not found');
					}
					else{
					$scope.pagenumber = 2;
					$scope.$apply($scope.tracking = value);
					$scope.$apply(document.getElementById("first-tracking-rma").value = value);
					document.getElementById("rma-number").focus();
					cordova.plugins.Keyboard.show();
					}

				}else{
					$scope.rma = tracking.packages[0].rma; 
					$scope.rfr = tracking.packages[0].return_exception;
					$scope.seller = tracking.packages[0].user_id;
					$scope.weight = tracking.packages[0].weight;
					$scope.pkgid = tracking.packages[0].id;
					$scope.pkstatus = tracking.packages[0].status;
					$scope.pagenumber = 5;
					$scope.oldphotos = tracking.packages[0].photos;
					$scope.displayextrafields = tracking.packages[0].barcodes;
					jQuery('#package-status-2 option[value="' + tracking.packages[0].status + '"]').prop('selected', true);

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

		var weight = document.getElementById('weight-2').value;
		var rma = document.getElementById('rma-number-2').value;
		var rfr = document.getElementById('rfr-2').value;
		var weightUnit = document.getElementById('weight-unit-2').value;
		var status = document.getElementById('package-status-2').value;
		var comments = document.getElementById('comments-2').value;

		if (rma == ""){
			rma = 0;
		}

		if (weight == ""){
			weight = 0;
		}

		if (weightUnit == "lbs"){
			weight = Math.round(weight * 0.453592 * 1000)/1000;
		}

		if (weightUnit == "oz"){
			weight = Math.round(weight * 0.0283495 * 1000)/1000;
		}
		
		if (rma == ""){
			rma = 0;
		}


		var i = $scope.photos.indexOf('R0lGODlhCgAKAIAAAP////Dz9yH5BAAAAAAALAAAAAAKAAoAAAIQhH+Bq5v+IGiQOsvkDLz7AgA7');

		if (i > -1) {
    		$scope.photos.splice(i, 1);
		}
		
		if(changes == 1){
			var putinfo = {
			 "package": {
			 	"rma": rma,
			 	"user_id": parseInt(document.getElementById("seller-number-2").value),
			 	"weight": weight,
			 	"return_exception": document.getElementById('rfr-2').value,
			    "photos": $scope.photos,
			    "return_exception": rfr,
			    "comments": comments,
			    "barcodes": extrafieldarr,
			    "status": status
				}
			};
		}else{
			var putinfo = {
			 "package": {
			    "photos": $scope.photos
				}
			};
		}

		$scope.pagenumber = 1;

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

				backupPhotoarr.push(imageData);
	   	 		$scope.$apply($scope.photos.push(imageData));

	  		}, function(err) {

	    			alert('Failed because: ' + message);

	  		}, { quality: 40, destinationType: Camera.DestinationType.DATA_URL, targetWidth: 600})	
		};

	$scope.pressEnter = function(eventNew) {
	  	if (eventNew.which==13){
	  		event.preventDefault();
	  		if (jQuery(document.activeElement).attr('id') == 'rma-number'){
	  			document.getElementById('rfr').value = 'RMA'; 
	  			document.getElementById('seller-number').focus();
	  		}else if(jQuery(document.activeElement).attr('id') == 'seller-number'){
	  			document.getElementById('weight').focus();
	  		}	
		}
	}

	$scope.deletePhoto = function(photo){
		var answer = confirm ("Are you sure you want to delete this photo?");
		if(answer){
			var index = $scope.photos.indexOf(photo);
			if (index != -1) {
    				return $scope.photos.splice(index, 1);
			}
		}

	}

	$scope.deleteOldPhoto = function(oldphoto){
		var answer = confirm ("Are you sure you want to delete this photo?");

		if(answer){
			var m = oldphoto.split("/").pop();
			var q = m.match(/\d+/i);
			var delurl = $scope.appapiurl + '/packages/' + $scope.pkgid + '/photos/' + q;
			
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

	$scope.testMode = function() {
		if(typeof $scope.testmode  === 'undefined'){
			$scope.testmode = true;
		}else{
			$scope.testmode = !$scope.testmode;
			window.localStorage['testmode'] = $scope.testmode;
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

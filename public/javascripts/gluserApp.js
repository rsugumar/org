(function (angular) {
 'use strict';

 var app = angular.module('filterApp', ['ngImgCrop','ui.grid','ui.grid.pinning','dndLists','angucomplete-alt']);

 /*
 app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
 }]);
 */

 app.controller ( 'gluserAppController', function ( $http, $log, $scope, $timeout ) {
	$scope.companies = companyList;
	$scope.managers = [];
	$scope.company = $scope.selectedCompany;
 	$scope.branches = [];
	$scope.isBranchVisible = true;
  $scope.myImage = '';

	$scope.generateBranches = function ( ) {
		$scope.branches = branchList[$scope.selectedCompany];
        $scope.selectedBranch = $scope.branches[0];
        $scope.isBranchVisible = false;
        $scope.managers.length = 0;

        managerList.forEach( function(element, index) {
            if(element.company == $scope.selectedCompany){
                $scope.managers.push(element);
            }
        });

        if ($scope.managers.length == 0) {
            createDummyManagerList();
        }

        $scope.selectedManager = $scope.managers[0];
    }


    var createDummyManagerList = function ( ) {
        var emptyManager = {_id: null,
                            fName: 'None',
                            mName: '',
                            lName: '',
                            company: 'NONE'};

        $scope.managers.push(emptyManager);
    }

    $scope.browseimageAlias = function ( ) {
        angular.element('#profilePicCreate').click();
    }

    $scope.handleFileSelect= function ( element ) {
        $scope.myCroppedImage = '';

        var reader = new FileReader();

        reader.onload = function ( evt ) {
            $scope.$apply( function ( $scope ) {
                $scope.myImage = evt.target.result;
                angular.element('#profilePicCreate').css('z-index', '-100');
                angular.element('#headerBrowseDragCr').css('display', 'none');
                angular.element('#browsedivbtnCr').css('display', 'block');
                angular.element('#browsedivbtnCr2').css('display', 'none');
            });
        };

        reader.readAsDataURL(element.files[0]);
    };

});

app.controller ('indexCtrl', function ( $http, $scope, $timeout ) {
	$scope.isUpdateVisible = false;

    $scope.mkUpdVisible = function ( ) {
    	$scope.isUpdateVisible = !$scope.isUpdateVisible;
    }
});

app.controller ('updateCompanyCtrl', function ( $http, $scope, $timeout ) {

	$scope.companyIds = companyIdList;
	$scope.companyId = $scope.selectedCompany;
 	//$scope.branchIds = [];

	$scope.generateBranches = function ( ) {
		$scope.branchIds = branchIdList[$scope.selectedCompany];
		//$scope.selectedBranch = $scope.branchIds[0];
 	}

 	$scope.move = function ( ) {
 		window.location.href = '/updatecompany/delete';
 	}
});

app.controller ('updateEmployeeCtrl', function ( $http, $scope, $log, $sce, $timeout ) {
  $scope.companies = companyList;
  $scope.managers = [];
  $scope.company = company;
  $scope.branch = branch;
  $scope.manager = manager;
  $scope.branches = [];
  $scope.isBranchVisible = true;
  $scope.myImage = '';

  $scope.initializeSelectedValue = function () {

      managerList.forEach( function(element, index) {
          var name = element.fName+' '+element.mName+' '+element.lName;

          if(name == manager ){
              $scope.selectedManager = element;
          }
      });
  }

  $scope.generateBranches = function ( ) {
      $scope.branches = branchList[$scope.selectedCompany];
      $scope.isBranchVisible = false;

       $scope.managers.length = 0;

      managerList.forEach( function(element, index) {
          if(element.company == $scope.selectedCompany){
              $scope.managers.push(element);
          }
      });

      $scope.initializeSelectedValue();
  }

  $scope.cancelImage = function ( ) {
      $scope.croppedImage = $sce.trustAsResourceUrl('/api/user/'+ $scope.profileId);
      var trustedResource = $sce.trustAsResourceUrl('/api/user/'+ $scope.profileId);
      $('#profilePicUpload').replaceWith($('#profilePicUpload').clone());
      // case in cancelling the cropped image to revert back to original image
      if( $scope.croppedImage == $sce.valueOf(trustedResource))
      {
          $scope.finalcroppedImageData = undefined;
          $log.log($scope.finalcroppedImageData);
      }
      $log.log($scope.finalcroppedImageData);
  }

  $scope.getIndexFromCompanyValue = function ( ) {
      for ( var i = 0; i < $scope.companies.length; i++) {
          if ($scope.companies[i] === $scope.company) {
              return i;
          }
      }
  }

  $scope.getIndexFromBranchValue = function ( ) {
      for ( var i = 0; i < $scope.branches.length; i++) {
          if ($scope.branches[i] === $scope.branch) {
              return i;
          }
      }
  }

  $scope.getIndexFromManagerValue = function ( ) {
      for ( var i = 0; i < $scope.managers.length; i++) {
          if ($scope.managers[i] === $scope.manager) {
              return i;
          }
      }
  }

  $scope.browseImageAlias = function ( ) {
      angular.element('#profilePicUpload').click();
  }

  $scope.setcroppedImage = function () {
      $scope.croppedImage = $scope.myCropImage;
      $scope.finalcroppedImageData = $scope.myCropImage;
      $scope.closeFancyboxCrop( ) ;
  }

	$scope.handleFileSelect = function ( element ) {
		$scope.croppedImage = '';
        $scope.myCropImage = '';
        $scope.finalcroppedImageData = '';
		var reader = new FileReader();
		console.log('i got called');
		reader.onload = function ( evt ) {

			$scope.$apply( function ( $scope ) {
				$scope.myImage = evt.target.result;
                angular.element('#profilePicUpload').css('z-index', '-100');
                angular.element('#headerBrowseDrag').css('display', 'none');
                angular.element('#browsedivbtn').css('display', 'block');
                angular.element('#browsedivbtn2').css('display', 'none');
                angular.element('#cropBtn').css('display', 'block');
                $scope.openFancyboxCrop( );
			});
		};
		reader.readAsDataURL(element.files[0]);
	};
});


app.directive('fancybox', function ($compile, $http) {
    return {
        restrict: 'A',

        controller: function($scope) {
            $scope.openFancybox = function (url) {

            	var template = angular.element('<img src='+url+'/>');
				var compiledTemplate = $compile(template);
				compiledTemplate($scope);

                $http.get(url).then(function(response) {
                     if (response.status == 200) {
                         $.fancybox.open({ content: template, type: 'image/*' });
                     }
                 });
            };

            $scope.openFancyboxCrop = function () {
                var template = angular.element('#imageCropDiv');
                var compiledTemplate = $compile(template);
                compiledTemplate($scope);
                $.fancybox.open({ content: template, type: 'image/*' });
            }

            $scope.closeFancyboxCrop = function () {
                $.fancybox.close();
            }
        }
    };
});

 app.controller ( 'LogoutController', function($scope, $log) {
    $scope.mkVisible = true;
    try {
        if(mkvisibleLogout != undefined) {
            $scope.mkVisible = mkvisibleLogout;
        }
    } catch(e) {
        console.log('caught');
    }
 });

 app.controller('bulkRegisterController', function($scope, $http, $q){
    //Define the grid options
    $scope.gridOptions = {
      enableSorting: true,
      enableGridMenu: true,
      showGridFooter: true,

      columnDefs: [
          { name:'Employee Id', field: 'EmployeeID', width:'130', pinnedLeft: true  },          
          { name:'Email Id', field: 'EmployeeEmailId', width:'200', pinnedLeft: true  },
          { name:'First Name', field: 'EmployeeFirstName', width:'200'  },
          { name:'Middle Name', field: 'EmployeeMiddleName', width:'200'  },
          { name:'Last Name', field: 'EmployeeLastName', width:'200'  },          
          { name:'Designation', field: 'EmployeeDesignation', width:'200'  },
          { name:'Address Line 1', field: 'EmployeeAdressL1', width:'200'  },
          { name:'Address Line 2', field: 'EmployeeAdressL2', width:'200'  },
          { name:'Address Line 3', field: 'EmployeeAdressL3', width:'200'  },
          { name:'City', field: 'EmployeeCity', width:'100'  },
          { name:'State', field: 'EmployeeState', width:'200'  },
          { name:'Country', field: 'EmployeeCountry', width:'100'  },          
          { name:'Pin Code', field: 'EmployeePinCode', width:'100'  },
          { name:'Mobile No', field: 'EmployeeMobNo', width:'100'  },
          { name:'Work No', field: 'EmployeeWorkNo', width:'100'  },          
          { name:'Home No', field: 'EmployeeHomeNo', width:'100'  },
          { name:'Branch Id', field: 'EmployeeBranchId', width:'100'  },
          { name:'Branch Name', field: 'EmployeeBranchName', width:'150'  }
      ],
      importerDataAddCallback: function ( grid, newObjects ) {
          $scope.data = $scope.data.concat( newObjects );
      },
      onRegisterApi: function(gridApi){
          $scope.gridApi = gridApi;
      }
    };


    //Populate the grid with data
    var canceler = $q.defer();
    $http.get('/api/users', {timeout: canceler.promise})
    .success(function(data) {
      var formatedData = [];
      for(var i=0; i <data.length; i++){
        var branchData = data[i];
        for(var j=0;j< branchData.length;j++){
          formatedData.push(branchData[j]);
        }
        
      }

      $scope.gridOptions.data = formatedData;
    });
 
    $scope.$on('$destroy', function(){
      canceler.resolve();  // Aborts the $http request if it isn't finished.
    });
  });

 
}(angular));

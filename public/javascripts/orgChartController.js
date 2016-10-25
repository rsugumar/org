angular.module('filterApp')
  .controller('OrgChartController',['$scope', '$timeout', 'UserService',
    function ($scope, $timeout, UserService ) {

    $scope.user = {
        name: "",
        id: "",
        designation: "",
        type: "",
        columns: [[]],
        parent: [],
        children: []
    }
    //For autocomplete search
    $scope.people= [];

    //For building the flow chart
    $scope.models = {
        selected: null,
        unAssignedUsers: [
        ],
        assignedUsers: [],
        dropzones: {
            "Mobionix": []
           
        }
    };

    $scope.relationShipMap = {};
    $scope.relationShipMap.root = {};

    
    //On drop of a node from un-assigned to the flow chart
    $scope.moveCallBack = function(event, index, item, external, type) {
             var index =  $scope.models.unAssignedUsers.indexOf(item);
             $scope.models.unAssignedUsers.splice(index, 1)  ;
             $scope.models.assignedUsers.push(item);
              
    };

    // $scope.spliceOnMoveCallBack = function (event, index, item, external, type) {
    //          var dropId = null;
    //          if($(event.target).has('p').length === 1){
    //             dropElement = $(event.target).children('p')[0];
    //             dropId = $(dropElement).text();
    //          }
    //          else{
    //             var parent = $(event.target).parent();
    //             dropElement = $(parent).children('p')[0];
    //             dropId = $(dropElement).text();
    //          }
    //          if($scope.relationShipMap.root[dropId] !== undefined){

    //            var index = $scope.relationShipMap.root[dropId].indexOf(item.id);
    //            $scope.relationShipMap.root[dropId].splice(index, 1);
    //            console.log("remove: "+$scope.relationShipMap);
    //          }            
    // };

    //Validate on drop of the picked item
    $scope.validateDrop =  function(event, index, item) {
             
             var dropElement = null;
             var dropId = null;
             if($(event.target).has('p').length === 1){
                dropElement = $(event.target).children('p')[0];
                dropId = $(dropElement).text();
             }
             else{
                var parent = $(event.target).parent();
                dropElement = $(parent).children('p')[0];
                dropId = $(dropElement).text();
             }

             if(dropId === item.id){
                return false;                
             }
             else{ 
                 var rootPresenceFlag = false;
                 
                  angular.forEach($scope.relationShipMap.root, function(parentValue, parentKey){                    
                      angular.forEach(parentValue, function(value,key){
                          //if the current id is already a child of a parent, remove it
                          if(value === item.id){
                             parentValue.splice(key, 1);
                          }                          
                     }); 
                     // if the parent has zero children remove it form the relaitonship map
                     if(parentValue.length === 0){
                            delete  $scope.relationShipMap.root[parentKey];
                     }                  
                                          
                  });

                  //Alter the relationship
                 if($scope.relationShipMap.root[dropId] === undefined){
                    $scope.relationShipMap.root[dropId] = [];
                    $scope.relationShipMap.root[dropId].push(item.employeeObjectId);
                 }
                 else{
                    $scope.relationShipMap.root[dropId].push(item.employeeObjectId);
                 }

                 console.log($scope.relationShipMap);              
                 return item;
             }           
             
    };

    //On selection of a item in autocomplete search
    $scope.selectedPerson = function(selected){
       if (selected) {
          var selectedId = selected.originalObject.id;
          var element = angular.element('.tree a[dnd-list]:contains("'+selectedId+'")');
            
          $(window).scrollTo(element, 800, {offset:-500});
          $(element).addClass('searchedActiveNode');
          $timeout( function(){
            $(element).removeClass('searchedActiveNode');
          }, 2500);
        } else {
          console.log('cleared');
        }
    };

   //Fetch all un-assigned users 
   function fetchUnAssignedUsers(){    
     UserService.getAllUnassignedUsers(
      function(res) {
        if(res.type){
          $scope.models.unAssignedUsers = res.data;
        }
          
      }, function(res) {
          $scope.message = res.message;           
          $('#errorModel').modal('show');
      });
   }
     
   fetchUnAssignedUsers();


    // CRUD Operations
    $scope.newUser = {};

    //Create new user
    $scope.createNewUser = function () {
        UserService.createUser($scope.newUser, function(res) {
              if(res.type){
                $('#addUserModal').modal('hide');
                res.data.type = "container";
                res.data.columns = [[]];
                $scope.models.unAssignedUsers.push(res.data);
                $scope.people.push(res.data);
              }
              else{
                $scope.message = res.message;           
                $('#errorModel').modal('show');
              }
               
            }, function() {  
                $scope.message = res.message;           
                $('#errorModel').modal('show');               
            }) ; 	
    };

    //Edit User Details
    $scope.editUserDetails = function(userId){
        //Fetch the user details and populate the editable fields
        UserService.getUserDetails(userId, function(res) {
              if(res.type){                
                $scope.user = res.data;                
              }
              else{
                $scope.message = res.message;           
                $('#errorModel').modal('show');
              }
               
            }, function() {  
                $scope.message = res.message;           
                $('#errorModel').modal('show');               
            }) ;  
    }

    //Save edited user details
    $scope.saveUserDetails = function(){        
        UserService.updateUserDetails($scope.user, function(res) {
              if(res.type){
                $('#editUserModal').modal('hide');                
                $scope.user = res.data;  
                fetchUnAssignedUsers();              
              }
              else{
                $scope.message = res.message;           
                $('#errorModel').modal('show');
              }
               
            }, function() {  
                $scope.message = res.message;           
                $('#errorModel').modal('show');               
            }) ;  
    }

    //Delete user
    $scope.deleteUser = function(userId){ 
      UserService.deleteUser(userId, function(res) {
                if(res.type){ 
                  $('#confirmationModal').modal('hide');
                  fetchUnAssignedUsers();
                  console.log("Successfully deleted");                          
                }
                else{
                  $scope.message = res.message;           
                  $('#errorModel').modal('show');
                }
                 
              }, function(res) {  
                  $scope.message = "Unkown Error has occured";           
                  $('#errorModel').modal('show');               
              }) ; 
    };

    //Tree manipulation

    //Save the org chart tree
    $scope.saveTree = function(){
         UserService.updateOrgTree($scope.relationShipMap.root, function(res) {
              if(res.type){
                 $scope.message = res.message;           
                 $('#errorModel').modal('show');              
              }
              else{
                // $scope.message = res.message;           
                // $('#errorModel').modal('show');
              }
               
            }, function() {  
                // $scope.message = res.message;           
                // $('#errorModel').modal('show');               
            }) ;        
    };

    //Fetch the org chart
    function fetchOrgChartTree(){    
     UserService.getOrgChartTree(
      function(res) {
        if(res.type){
          buildOrgChart(res.data);
        }
          
      }, function(res) {
          $scope.message = res.message;           
          $('#errorModel').modal('show');
      });
   }

   fetchOrgChartTree();

   function buildOrgChart(data){
      var orgChart = [];
      var orgChartUserJson = {};
      angular.forEach(data, function(value, key) {
            orgChartUserJson[value._id] = value;
            orgChart.push(value);
      });


      // angular.forEach(data, function(value, key) { 
      //  var parent = value;      
      //   angular.forEach(value.children, function(childValue, childKey){
      //        angular.forEach(data, function(parentValue, parentKey){
      //             if(parentValue._id !== childValue){
      //                if(parent.columns[0].length ===0){
      //                   parent.columns[0].push(orgChartUserJson[childValue]); 
      //                }
      //                else{
      //                   parent.columns[0].push(orgChartUserJson[childValue]);
      //                } 
      //                var index =  orgChart.indexOf(orgChartUserJson[childValue]);
      //                if(index >= 0){                      
      //                   orgChart.splice(index, 1);
      //                }
      //             }
      //        }); 
      //   });

       
      // });
      $scope.models.dropzones['Mobionix'] = orgChart;
    };


  }]);
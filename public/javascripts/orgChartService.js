angular.module('filterApp')
  .factory('UserService', ['$http', 
    function ($http) {
    	var baseUrl = "http://localhost:3000/orgChart";
        
    	return {
            createUser: function(data, success, error) {
                $http.post(baseUrl + '/users/', data).success(success).error(error)
            },

            getAllUnassignedUsers : function(success, error) {
                $http.get(baseUrl + '/users/allUnassignedUsers').success(success).error(error)
            },

            getUserDetails :  function(userId, success, error) {
                $http.get(baseUrl + '/users/getUserDetails?id='+userId+'').success(success).error(error)
            },
            updateUserDetails: function(data, success, error) {
                $http.post(baseUrl + '/users/updateUserDetails', data).success(success).error(error)
            },
            deleteUser :  function(userId, success, error) {
                $http.delete(baseUrl + '/users/deleteUser?id='+userId+'').success(success).error(error)
            },
            updateOrgTree : function(data, success, error) {
               $http.post(baseUrl + '/users/updateOrgTree', data).success(success).error(error)
            },
            getOrgChartTree : function(success, error) {
                $http.get(baseUrl + '/users/getOrgChartTree').success(success).error(error)
            },

            // ,
            // signin: function(data, success, error) {
            //     $http.post(baseUrl + '/users/authenticate', data).success(success).error(error)
            // },
            // me: function(success, error) {
            //     $http.get(baseUrl + '/users/me').success(success).error(error)
            // },
            // logout: function(success) {
            //     changeUser({});
            //     delete $localStorage.token;
            //     success();
            // }
        };
    }]);

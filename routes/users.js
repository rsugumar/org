/**************************************************************************
* Author: Sukumar Raghavan
* FileName: users.js
* Description: List of all User Infos are served.
* History:
*  Initial Release   17-June-2015
**************************************************************************/
var express = require('express');
var router = express.Router();
var server = require( '../server' );
var arrayList = require('arraylist');
var _ = require ( 'underscore' );

router.get ( '/', function ( req, res, next ) {
	var sendList = server.orgCacheInstance.getEmployeeList ( );
	var newList = new arrayList;
	var branchList = server.orgCacheInstance.getBranchList ( );
	_.each ( branchList, function ( item ) {
		var newBranch = new arrayList;
		_.each ( sendList, function ( user ) {
			if(user.EmployeeBranchName == item.BranchName) {
				newBranch.push(user);
			}
		});
		newList.push(newBranch);
	});
	//console.log(newList);
	res.send ( newList );
} );


module.exports = router;

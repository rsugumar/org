/*************************************************************************
* Author: Sukumar Raghavan/ Abhi
* FileName: company.js
* Description: Company Registration
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var arrayList = require('arraylist');
var router = express.Router();
var _ = require('underscore');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;

var server = require( '../server' );


var companyList = new arrayList;
var branchList = new arrayList;
var dbQueryList = new arrayList;
var EmployeeList = new arrayList;
var compBranList = new arrayList;


router.get('/', function ( req, res, next) {
    companyList = server.orgCacheInstance.getCompanyList( ) ;
	res.send( companyList );
});

router.get('/:dynamicroute',function(req, res, next) {
    
    companyList =  server.orgCacheInstance.getCompanyList( ) ;

	function resultCompany ( result ){
		 res.send( result );
	}
	
	
	var List = new arrayList;
	_.each ( companyList, function ( newList ){
	    List.push ( newList.CompanyName );
	});	
	

	if (List.contains(req.params.dynamicroute))
	{
		for (var i=0; i< companyList.length; i++) {
        	var tempComp = companyList[i];
        		if ( tempComp.CompanyName == req.params.dynamicroute )
        		{
                	resultCompany ( companyList[i] );
                	break;
        		} 
        	}	
	}
	else 	
	{
		res.sendStatus ( 404 );
	} 
});



//Displays the branches of a company

router.get('/:dynamicroute/branch',function(req, res, next) {

    companyList =  server.orgCacheInstance.getCompanyList( ) ;

	function resultCompany ( result ){
                 res.send( result );
        }


	var List = new arrayList;
	_.each ( companyList, function ( newList ) {
    	List.push ( newList.CompanyName );
	});
	
	if (List.contains(req.params.dynamicroute))
        {
                for (var i=0; i< companyList.length; i++) {
                var tempComp = companyList[i];
                        if ( tempComp.CompanyName == req.params.dynamicroute )
                        {
                        resultCompany ( companyList[i].Branches );
                        break;
                        }
                }
        }
	 else
        {
                res.sendStatus ( 404 );
        }

});

//Displays the particular branch detail with contacts

router.get('/:dynamicroute/branch/:branch', function(req, res, next) {
    
    companyList =  server.orgCacheInstance.getCompanyList( ) ;
    branchList = server.orgCacheInstance.getBranchList( ) ;
    compBranList = server.orgCacheInstance.getCompBranList( ) ;

	var List = new arrayList;
	var branList = new arrayList;

	_.each ( companyList, function ( newList ) {
    	List.push (newList.CompanyName );
	});

	_.each ( branchList, function ( newList ) {
	    branList.push ( newList.BranchName );
	});


	if (List.contains(req.params.dynamicroute)){
		if (branList.contains(req.params.branch)){
			for ( var i = 0 ; i < compBranList[req.params.dynamicroute].length ; i++ ){
			var newList = compBranList[req.params.dynamicroute][i];
			if ( newList == req.params.branch )
			{
				for(var j=0 ; j < branchList.length; j++ )
				{	
					var tempBran = branchList[j];
					if (tempBran.BranchName == req.params.branch){
					resultCompany ( branchList[j] );
					break;
					}
				}
			}		
			}
		}
		else
		{
		res.sendStatus ( 404 );
		}
	}
	else
	{
	res.sendStatus ( 404 );
	}
	
	function resultCompany ( result ){
	res.send ( result );
	}
});

//Display the managers with respect to the branch

router.get('/:dynamicroute/:branch/Employees', function(req, res, next) {

	companyList =  server.orgCacheInstance.getCompanyList( ) ;
    branchList = server.orgCacheInstance.getBranchList( ) ;
    employeeList = server.orgCacheInstance.getEmployeeList( ) ;
	
	function resultBranch(err , result) {
        _.each ( result, function ( entry ) {
			console.log ( entry );
	        _.each ( entry.branches, function ( branch ) {
		        if ( branch.branchName == req.params.branch ) {
		        	Branch.find({branchName: req.params.branch}, '_id' )
		        		.populate('_id')
		        		.exec ( resultBran );
					function resultBran (err, result) {
						console.log( result );
						var resultid = 	result[0]["_id"];
						console.log( resultid);
		        		Employee.find({branch: ObjectId(resultid)}, 'empName designation empId')
		        			.populate('empName')
		        			.exec( empresult );
						function empresult (err, rresult) {
							res.send ( rresult );
						}
		        	}
		        }
			} );
		} );
    }

	if(companyList.contains(req.params.dynamicroute) ) {
        Company.find({companyName: req.params.dynamicroute}, 'companyName branches')
        .populate( 'branches')
        .exec( resultBranch );
	} else	{
		res.sendStatus ( 404 );
		return;
	}
});


router.get('/:_id', function(req, res, next) {
	function resultCom ( err, result ) {
    	res.send( result );
    }

  Company.find ( {_id: ObjectId( req.params._id )} )
  	.populate ( 'company address contact' )
    .exec ( resultCom );
});

module.exports = router;

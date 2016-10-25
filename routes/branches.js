/**************************************************************************
* Author: Abhi 
* FileName: branches.js
* Description: Organization branch request will be served here.
* History:
* Initial Release   07-July-2015
**************************************************************************/
var express = require('express');
var router = express.Router();

var server = require('../server');
var CompanyModel = require('../models/CompanyModel');
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;

//* Get Branches" */
router.get('/company/:dynamicroute/branches', function(req, res, next) {
var companyList = [];
var branchList = [];

var companyQuery = function ( callback ) {
      Company.find ( {}, 'companyName branches' )
             .populate ( 'branches' )
             .exec ( function ( err, result ) {
         _.each ( result, function ( entry ) {
            companyList.push ( entry.companyName );
            _.each ( entry.branches, function ( branch ) {
               branchList[entry.companyName] = [];
               branchList[entry.companyName].push ( branch.branchName );
               } );
         } );
         callback ( );
      } );
    }
	
dbQueryList.push ( companyQuery );	

async.parallel (dbQueryList, function ( ) {
	 console.log ( 'Got in time: \nCompanyList: ', companyList );
     console.log ( 'BranchList: ', branchList );
});
	 
function resultBran( err, result) {
	res.send( result );
}

Company.find({companyName: req.params.dynamicroute})
    .populate( 'branchList[companyName].branchName' )
		.exec (resultBran);

});

module.exports = router;

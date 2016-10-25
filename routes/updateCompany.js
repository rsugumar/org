/**************************************************************************
* Author: Abhi Krishnan
* FileName: index.js
* Description: Index file
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var arrayList = require('arraylist');
var router = express.Router();
var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


var Address = require('../models/AddressModel');
var Contact = require('../models/ContactModel');
var EmployeeModel = require('../models/EmployeeModel');
var Employee = require('../models/EmployeeModel').Employee;
var ProfilePix = require('../models/EmployeeModel').ProfilePix;
var EmpName = require('../models/EmployeeModel').empName;
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;
var OrgHierarchy = require('../models/OrgHierarchy');
var server = require( '../server' );


router.get('/', function(req, res, next) {

	var companyIdList = [];
	var branchIdList = {};

	var companyList = server.orgCacheInstance.getCompanyList( ) ;
		_.each ( companyList, function ( item ) {
		companyIdList.push(item.CompanyID);
	});

	var branchIdCacheList = server.orgCacheInstance.getCompBranchIDList( ) ;
	branchIdList = branchIdCacheList;

	console.log(branchIdList);

	console.log ("companyIdList" +companyIdList);
	res.render('updateCompany', { companyIdList: companyIdList,
								  isDisabled: false,
								  branchIdList: branchIdList });
});


//post for searching the record
router.post ( '/', function ( req, res, next ) {
   	console.log ( 'Received:\n', req.body );

	var companyIdList = [];
	var branchIdList = {};

	var companyList = server.orgCacheInstance.getCompanyList( ) ;
		_.each ( companyList, function ( item ) {
		companyIdList.push(item.CompanyID);
	});

	var branchIdCacheList = server.orgCacheInstance.getCompBranchIDList( ) ;
	branchIdList = branchIdCacheList;

    var tasks = [];

    var compObjId = '';
    var branchObjId = '';
    var companyName = '';
    var companyId = '';

	var fetchQuery = function ( callback ) {
		console.log ( 'fetchQuery..');
		Company.findOne({companyID: req.body.CompanyId},'_id companyName companyID branches' )
				.populate('branches')
				.exec(function ( err, result ) {
					if (err) {
						throw err;
					}

					if( result ) {
						compObjId = result._id;
						companyName = result.companyName;
						companyId = result.companyID;
						callback ( );

					} else {
						res.sendStatus(404);
					}
				});
	}

	var branchQuery = function ( callback ) {
		console.log( 'compQuery...');
		Branch.findOne({branchId: req.body.branchId},'branchId branchName address contacts').
						populate('address contacts').
						exec (function ( err, result) {
						if (err) {
							throw err;
						}

 						if( result ) {
 							branchObjId = result._id;
 							res.locals.companyName = companyName;
 							res.locals.companyId = companyId;
 							res.locals.branchName = result.branchName;
 							res.locals.branchId = result.branchId;

						if(result.contacts != null) {
							_.each ( result.contacts, function ( item ){
								res.locals.workNumber = item.workNo;
								res.locals.mobNumber = item.mobNo;
								res.locals.email = item.emailId;
							});
						}

							if(result.address != null) {
						res.locals.addrL1 = result.address.addressLine1;
						res.locals.addrL2 = result.address.addressLine2;
						res.locals.addrL3 = result.address.addressLine3;
						res.locals.city = result.address.city;
            res.locals.pinCode = result.address.pinCode;
						res.locals.state = result.address.state;
						res.locals.country = result.address.country;
						}

						res.render('updateCompany', { isDisabled: true,
													  companyIdList: companyIdList,
													  branchIdList: branchIdList ,
													  companyObjId: compObjId,
													  branchObjId: branchObjId });
 						} else {
						   res.sendStatus(404);
 						}
   				});
	}

   tasks.push ( fetchQuery );
   tasks.push ( branchQuery );


	async.series ( tasks, function ( ) {
		console.log ( 'Finally reinitialize...' );
		server.orgCacheInstance.reInitialize ( );
    });

});

//post for updating the record
router.post ( '/upddel', function ( req, res, next ) {
	console.log ( 'Received:\n', req.body );

	var tasks = [];
	var contactid = [];
	var addressid = '';
/* sample input
{ cName: 'Accenture',
  cId: '123',
  brName: 'Accenture Bangalore',
  brId: '1231',
  workNo: '9876543210',
  mobNo: '987987987',
  emailId: 'asd@asd.cos.om',
  addressLine1: 'asd 123 asd',
  addressLine2: 'sample asd',
  addressLine3: 'sample asd',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  companyid: '567406c3c6c83b6b13e59206',
  branchid: '567406c3c6c83b6b13e59207',
  button: 'Update' / 'Delete' }
*/

if( req.body.button == 'Update') {

//doing the update
	var companyupdatequery = function ( callback ) {
		Company.findOne({_id: req.body.companyid}).
						exec ( function ( err, result ) {
								if( result ){
									var branchesarray = [];
									_.each ( result.branches, function ( item ){
										branchesarray.push(ObjectId(item));
									});
									Company.findOneAndUpdate(
											{ _id: req.body.companyid } ,
											{
												$set:   {
														companyID: req.body.cId,
														companyName: req.body.cName,
														branches: branchesarray,
															__v: result.__v,
														}
											},
											{new: true},
											function ( err, result ) {
												if ( err ){
													console.log("err @ companyUpdate:" +err);
													res.sendStatus ( 404 );
												}

												if ( result ){
													console.log("success @ companyUpdate:" +result);
													callback ( );
												}

											});
								} else {
									res.sendStatus ( 404 );
								}
						});
	}


	var branchupdatequery = function ( callback ) {
		Branch.findOne({_id: req.body.branchid}).
						exec ( function ( err, result ) {
								if( result ){
									var contactsarray = [];
									_.each ( result.contacts , function ( item ) {
										contactid.push(ObjectId(item));
										contactsarray.push(ObjectId(item));
									});
									addressid = ObjectId(result.address);

									Branch.findOneAndUpdate(
														{ _id: req.body.branchid } ,
														{
															$set:   {
																	contacts: contactsarray,
																	__v: result.__v,
																	branchName: req.body.brName,
																	branchId: req.body.brId,
																	company: result.company,
																	address: result.address,
																	}
														},
														{new: true},
														function ( err, result ) {
															if ( err ){
																console.log("err @ branchUpdate:" +err);
																res.sendStatus ( 404 );
															}

															if ( result ){
																console.log("success @ branchUpdate:" +result);
																callback ( );
															}
														});
									//callback ( );
								} else {
									res.sendStatus ( 404 );
								}

						});
	}

	var contactupdatequery = function ( callback ){
		console.log(contactid);
		if(contactid != null){
			_.each( contactid , function ( item ) {
				Contact.findOne({_id: contactid}).
							exec ( function ( err, result ) {
									if( result == null ){
										console.log("result is null @ contact !");
										callback( );
									} else {
										console.log ( "contact update :" + result);
									Contact.findOneAndUpdate(
												{ _id: contactid } ,
												{
													$set:   {
															emailId: req.body.emailId,
															__v: result.__v,
															mobNo: req.body.mobNo,
															workNo: req.body.workNo,
																objectID: result.objectID,
																isVisible: result.isVisible
															}
												},
												{new: true},
												function ( err, result ) {
													if ( err ){
														console.log("err @ contactUpdate:" +err);
														res.sendStatus ( 404 );
													}

													if ( result ){
														console.log("success @ contactUpdate:" +result);
														callback ( );
													}
												});
									}
									if ( err ) {
										res.sendStatus ( 404 );
									}
							});
			});
		} else {
			console.log(" contact not mapped !! ");
		}
	}

	var addressupdatequery = function ( callback ) {
		console.log(addressid);
		if(addressid != null){
			Address.findOne({_id: addressid}).
				exec ( function ( err, result ) {
						if( result == null ){
							console.log("result is null @ Address !");
							callback ( );
						} else {
							Address.findOneAndUpdate(
									{ _id: addressid } ,
									{
										$set:   {
												addressLine1: req.body.addressLine1,
												addressLine2: req.body.addressLine2,
												addressLine3: req.body.addressLine3,
												city: req.body.city,
                        pinCode: req.body.pinCode,
												state: req.body.state,
												country: req.body.country,
												ObjectID: result.ObjectID,
													__v: result.__v,
												}
									},
									{new: true},
									function ( err, result ){
											if ( err ){
												console.log("err @ AddressUpdate:" +err);
												res.sendStatus ( 404 );
											}

											if ( result ){
												console.log("success @ AddressUpdate:" +result);
												callback ( );
											}
									});
						}
						if ( err ) {
							res.sendStatus ( 404 );
						}
				});
		} else {
			console.log(' address not mapped !!');
		}
	}

	tasks.push ( companyupdatequery );
	tasks.push ( branchupdatequery );
	tasks.push ( contactupdatequery );
	tasks.push ( addressupdatequery );


	async.series ( tasks, function ( ) {
		console.log ( 'Finally reinitialize...' );
		server.orgCacheInstance.reInitialize ( );
		res.writeHead( 200, {'Location': '/updateCompany'});
		res.end();
	});



} else if(req.body.button == 'Delete Company') {
		//do delete
			console.log('delete company');
			var branchIdList = [];

	var findthebranchesQuery = function ( callback ){
		Company.findOne({_id: req.body.companyid}).
						exec ( function ( err , result ) {
							if ( result == null ){
								console.log ( 'No branches to delete ');
								callback();
							}

							else if ( err ) {
								console.log ( err );
								res.sendStatus ( 403 );
							}

							else {
								branchIdList = result.branches;
								callback ();
							}
						});
	}


	var deletebranchesQuery = function ( callback ) {
		var i = 1;
		if(0 ==  branchIdList.length || branchIdList == null ){
			console.log( ' No branches to delete ');
			callback();
			return;
		}
		_.each ( branchIdList , function ( item ) {
			Branch.findOne({_id: item}).remove().
								exec ( function ( err, result ) {
										if( result ){
											console.log ( "this is the result which got deleted :" + result);
											if( i == branchIdList.length){
												callback();
											} else {
												i++;
											}
										}
										if( err ) {
											console.log( err );
											res.sendStatus ( 404 );
										}

								});
		});
	}

	var companydeleteQuery = function ( callback ) {
		Company.findOne({_id: req.body.companyid}).remove().
								exec ( function ( err, result ) {
										if( result ){
											console.log ( "this is the result which got deleted :" + result);
											callback ();
										}
										if( err ) {
											console.log( err );
											res.sendStatus ( 404 );
										}

								});
	}


	tasks.push ( findthebranchesQuery );
	tasks.push ( deletebranchesQuery );
	tasks.push ( companydeleteQuery );


	async.series ( tasks, function ( ) {
		console.log ( 'Delete Successfull .. Finally reinitialize...' );
		server.orgCacheInstance.reInitialize ( );
		res.writeHead( 200, {'Location': '/updateCompany'});
		res.end();
	});

} else {

		console.log('deleting branch');

		if( req.body.branchid == null || req.body.branchid == undefined){
			console.log ( 'Branch not found ' );
			res.sendStatus ( 404 );
		} else {
		Branch.findOne({_id: req.body.branchid}).remove().
								exec ( function ( err, result ) {
										if( result ){
											console.log ( "this is the result which got deleted :" + result);
											res.writeHead( 200, {'Location': '/updateCompany'});
											res.end();
										}

										if( err ) {
											console.log( err );
											res.sendStatus ( 404 );
										}

								});
		}
  }
});


module.exports = router;

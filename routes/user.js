/**************************************************************************
* Author: Sukumar Raghavan
* FileName: user.js
* Description: User Info is served.
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var async = require('async');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('underscore');

var Address = require('../models/AddressModel');
var Contact = require('../models/ContactModel');
var EmployeeModel = require('../models/EmployeeModel');
var Employee = require('../models/EmployeeModel').Employee;
var ProfilePix = require('../models/EmployeeModel').ProfilePix;
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;
var OrgHierarchy = require('../models/OrgHierarchy');
var server = require( '../server' );

/* GET User Registration page. */

router.get ( '/', function ( req, res, next ) {
   var companyList = [];
   var branchList = {};
   var managerList = [];
   var dbQueryList = [];

   var companyQuery = function ( callback ) {
      Company.find ( {}, 'companyName branches' )
             .populate ( 'branches' )
             .exec ( function ( err, result ) {
        _.each ( result, function ( entry ) {
          companyList.push ( entry.companyName );
  		  branchList[entry.companyName] = [];
          _.each ( entry.branches, function ( branch ) {
            branchList[entry.companyName].push ( branch.branchName );
          } );
        } );
        callback ( );
      } );
    }

   var managerQuery = function ( callback ) {
      Employee.find ( {}, 'empName company'  )
               .populate ( 'empName company' )
               .exec ( function ( err, result ) {
         _.each ( result , function ( entry ) {
            console.log ( entry );
            var manager = {_id: entry._id,
                           fName: entry.empName.fName,
                           mName: entry.empName.mName,
                           lName: entry.empName.lName,
                           company: entry.company.companyName
                           };
            managerList.push ( manager );
         } );
         callback ( );
      } );
   }

   dbQueryList.push ( companyQuery );
   dbQueryList.push ( managerQuery );

   async.parallel ( dbQueryList, function ( ) {
      console.log ( 'Got in time: \nCompanyList: ', companyList );
      console.log ( 'BranchList: ', branchList );
      console.log ( 'ManagerList: ', managerList );
      res.render('user', { title: 'Employee Registration',
                           companyList: companyList,
                           branchList: branchList,
                           managerList: managerList } );
   } );
} );

router.post ( '/', function ( req, res, next ) {
   console.log ( 'Received:\n', req.body );

   var tasks = [];
   var companyList = [];
   var companyId = '';
   var branchId = '';
   var managerQueryResult = {};
   var fileUploadDetails = {data: '',
                            metadata: { fileType: '', fileSize: 0 } };

  // for removing the base64 header from the received buffer
  var croppedImgHeader = "data:image/png;base64,";
  if (req.body.croppedImage != null) {
     var base64Data = req.body.croppedImage.slice(croppedImgHeader.length);

     // encode in base64 format
     var dataBuffer = new Buffer(base64Data, 'base64');
     fileUploadDetails.data = dataBuffer;
     fileUploadDetails.metadata.fileType = "png";
     fileUploadDetails.metadata.fileSize = dataBuffer.length;
  }

   var compQuery = function ( callback ) {
      console.log ( 'compQuery...' );
      Company.findOne ( {companyName: req.body.company},
                        '_id',
                        function ( err, result ) {
         if ( err )
            throw err;

         if ( result ) {
            companyId = result._id;
            callback ( );
         }
      } );
   }

   var branchQuery = function ( callback ) {
      console.log ( 'BranchQuery...' );
      Branch.findOne ( {branchName:req.body.branch},
                       'branchId',
                       function ( err, result ) {
         if ( err ) {
            throw err;
         }

         if ( result ) {
            branchId = result._id;
            callback ( );
         }
      } );
   }

   var managerQuery = function ( callback ) {
      console.log ( 'managerQuery...' );
      OrgHierarchy.findOne ( { employee: ObjectId ( req.body.manager ) },
                             function ( err, result ) {
         managerQueryResult = result;
         callback ( );
      } );
   }

   var saveItToDB = function ( callback ) {
      console.log ( 'saveItToDB...' );

      var emp = new Employee ( );
      var empName = new EmployeeModel.EmployeeName ( );
      var profilePix = new EmployeeModel.ProfilePix ( );
      var empContact = new Contact ( );
      var empAddress = new Address ( );
      var orgHierarchy = new OrgHierarchy ( );

      empName.fName = req.body.fName;
      empName.mName = req.body.mName;
      empName.lName = req.body.lName;
      empName.employee = emp._id;

      empContact.objectID = emp._id;
      empContact.workNo = req.body.workNo;
      empContact.mobNo = req.body.mobNo;
      empContact.emailId = req.body.emailId;

      empAddress.objectID = emp._id;
      empAddress.addressLine1 = req.body.addressLine1;
      empAddress.addressLine2 = req.body.addressLine2;
      empAddress.addressLine3 = req.body.addressLine3;
      empAddress.city = req.body.city;
      empAddress.pinCode = req.body.pinCode;
      empAddress.state = req.body.state;
      empAddress.country = req.body.country;

      emp.empId = req.body.empId;
      emp.designation = req.body.designation;
      emp.department = req.body.department;
      emp.division = req.body.division;
      emp.skillSets = req.body.skillSets;

      emp.empName = empName._id;
      emp.company = companyId;
      emp.branch = branchId;
      emp.contact = empContact._id;
      emp.address = empAddress._id;
      emp.profilePix = profilePix._id;

      profilePix.employee = emp._id;
      profilePix.data = fileUploadDetails.data;
      profilePix.fileType = fileUploadDetails.metadata.fileType;
      profilePix.fileSize = fileUploadDetails.metadata.fileSize;

      orgHierarchy.employee = emp._id;
      orgHierarchy.children = [];
      orgHierarchy.parents = null;

      if (req.body.manager != 'null') {
        orgHierarchy.parents = req.body.manager;
      }

      EmployeeModel.Employee.findOne( {'empId': emp.empId},
                                      function ( err, entry ) {
            if ( err ) {
               throw err;
            }

            if ( !entry ) {
               empName.save ( );
               empContact.save ( );
               empAddress.save ( );
               profilePix.save ( );
               emp.save ( );
               if ( _.isEmpty(managerQueryResult) ) {
                  if ( req.body.manager != 'null' ) {
                     var mgrOrgHierarchy = new OrgHierarchy ( );
                     mgrOrgHierarchy.employee = ObjectId ( req.body.manager );
                     mgrOrgHierarchy.children.push ( emp._id );
                     mgrOrgHierarchy.
                        parents = server.
                                  orgCacheInstance.
                                  getParentObjId ( req.body.manager );
                     mgrOrgHierarchy.save ( );
                  }
               } else {
                  var children = managerQueryResult.children;
                  children.push ( emp._id );
                  OrgHierarchy.update (
                        { employee: ObjectId ( req.body.manager ) },
                          { $set: { children: children } },
                          function ( err, result ) {
                              console.log ( 'Record updated...' );
                          } );
               }

               orgHierarchy.save ( );

               console.log ( 'Document is saved...' );
               res.writeHead( 301, {'Location': '/user'});
               res.end();
               //res.status ( 201 ).send({status: 201, data: null, message: 'Document created.'});
            } else {
               console.log ( 'Document ALREADY found with EmpID: ',
                  emp.empId );
               console.log ( 'NOT Creating document...', emp.empId );
               res.writeHead( 403, {'Location': '/user'});
               res.end();
               //res.status ( 403 ).send({status: 403, data: null, message: 'Document already exist!'});
            }
            callback ( );
      } );
   }

   tasks.push ( compQuery );
   tasks.push ( branchQuery );
   if (req.body.manager != 'null') {
      tasks.push ( managerQuery );
   }
   tasks.push ( saveItToDB );

   async.series ( tasks, function ( ) {
      console.log ( 'Finally reinitialize...' );
      server.orgCacheInstance.reInitialize ( );
   } );
} );

/* GET chart */
router.get('/:_id', function(req, res, next) {
  function resultCb ( err, result ) {
    res.send( result );
  }

  Employee.find ( {_id: ObjectId( req.params._id )} ).
           populate ( 'empName company branch address contact' ).
           exec ( resultCb );
});


module.exports = router;

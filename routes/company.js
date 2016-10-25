/*************************************************************************
* Author: Sukumar Raghavan/ Abhi
* FileName: company.js
* Description: Company Registration
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var router = express.Router();
var _ = require('underscore');

var async = require('async');
var CompanyModel = require('../models/CompanyModel');
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;
var Address = require('../models/AddressModel');
var Contact = require('../models/ContactModel');
var server = require( '../server' );


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('company', { title: 'Company Registration' });
});

router.post ( '/', function ( req, res, next ) {
   console.log ( 'Received:\n', req.body );

   var company = new Company ( );
   var branch = new Branch ( );
   var companyAddress = new Address ( );
   var companyContact = new Contact ( );

   companyAddress.objectID = branch._id;
   companyAddress.addressLine1 = req.body.addressLine1;
   companyAddress.addressLine2 = req.body.addressLine2;
   companyAddress.addressLine3 = req.body.addressLine3;
   companyAddress.city = req.body.city;
   companyAddress.pinCode = req.body.pinCode;
   companyAddress.state = req.body.state;
   companyAddress.country = req.body.country;

   companyContact.objectID = branch._id;
   companyContact.workNo = req.body.workNo;
   companyContact.mobNo = req.body.mobNo;
   companyContact.emailId = req.body.emailId;

   branch.branchName = req.body.brName;
   branch.branchId = req.body.brId;

   branch.company = company._id;
   branch.address = companyAddress._id;
   branch.contacts = companyContact._id;

   company.companyID = req.body.cId;
   company.companyName = req.body.cName;
   company.branches.push ( branch );

   CompanyModel.Company.findOne( {'companyID': company.companyID} )
                       .populate( 'branches' )
                       .exec ( function ( err, foundCompany ) {
         if ( err ) {
            console.log ( 'Err occurred' );
         }

         if ( !foundCompany ) {
            companyAddress.save ( );
            branch.save ( );
            companyContact.save ( );
            company.save ( );

            console.log ( 'Finally reinitialize...' );
            server.orgCacheInstance.reinitializedbCache(function(){
              res.writeHead ( 301, {'Location': '/'});
              res.end();
            });

            
            //res.sendStatus ( 201 );
         } else {
            var match = _.findWhere (foundCompany.branches, {branchId: branch.branchId});
            console.log ( 'match: ', match );
            if ( match === undefined ) {
              companyAddress.save();
              companyContact.save();
              branch.save ( );
              foundCompany.branches.push ( branch );
              foundCompany.save();

              console.log ( 'Finally reinitialize...' );
              server.orgCacheInstance.reinitializedbCache(function(){
                  res.writeHead ( 301, {'Location': '/'});
                  res.end();
              });

            
               //res.sendStatus ( 201 );
            } else {
               console.log ( 'Document ALREADY found with COMPANY_ID: %d BRANCH_ID: %d',
                             company.companyID, branch.branchId );
               console.log ( 'NOT Creating document...', company.companyID );
               res.writeHead( 403, {'Location': '/'});
               res.end();
               //res.sendStatus ( 403 );
            }
         }
     } );
} );


module.exports = router;

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
var fs = require('fs');

var Address = require('../models/AddressModel');
var Contact = require('../models/ContactModel');
var EmployeeModel = require('../models/EmployeeModel');
var Employee = require('../models/EmployeeModel').Employee;
var ProfilePix = require('../models/EmployeeModel').ProfilePix;
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;
var OrgHierarchy = require('../models/OrgHierarchy');
var server = require( '../server' );

/* GET chart */
router.get('/:_id', function(req, res, next) {
  function resultCb ( err, result ) {
    res.send( result );
  }

  Employee.find ( {_id: ObjectId( req.params._id )} ).
           populate ( 'empName company branch address contact' ).
           exec ( resultCb );
});

router.get('/:_id/profilePix', function(req, res, next) {
  function getMimeType ( fileType ) {
    var mimeTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.png': 'image/png',
    };
    console.log ( 'FileType: ', fileType );
    var ext = '.' + fileType;
    var mimeType = mimeTypeMap[ext];
    return mimeType;
  }

  ProfilePix.findOne ( {employee: ObjectId(req.params._id)},
                      function ( err, result ) {
    if ( err ) {
      res.writeHead( 404, {'Location': '/user'});
      res.end();
      //res.status ( 404 ).send({status: 404, data: null, message: 'Record not found!' });
      return;
    }

    if ( result ) {
      if (result.fileSize > 0) {
        var rawData = result.data;
        var mimeType = getMimeType ( result.fileType );
        console.log ( 'MimeType: ', mimeType );
        res.writeHead(200, {'Content-Type': mimeType});
        res.write(rawData, 'utf8');
        res.end ( );
      } else {
        res.send("Empty");
      }
    }
  } );
});


module.exports = router;

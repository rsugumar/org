/**************************************************************************
* Author: Sukumar Raghavan
* FileName: setupAdmin.js
* Description: New Admin Setup here.
* History:
* Initial Release   24-Jan-2016
**************************************************************************/
var express = require('express');
var router = express.Router();

var userAuth = require('../models/UserAuth');
var ADMIN_MAIL_ID = 'sukumar@mobionix.com';
var ADMIN_PASSWD = 'gluserApp';
var IS_ADMIN = true;

router.get('/', function(req, res) {

  if(userAuth.findOne({emailid: ADMIN_MAIL_ID})
             .exec(function(err, result) {
    if (err) {
      throw err;
    }

    if (result) {
      console.log ('User Exists already. No Admin Setup Needed Now!');
      res.send( {success: false} );
    } else {
      var adminUser = new userAuth({
        emailid: ADMIN_MAIL_ID,
        password: ADMIN_PASSWD,
        isAdmin: IS_ADMIN
      });

      adminUser.save(function(err) {
        if (err) {
          throw err;
        }

        console.log('User Saved Successfully!');
        res.send( {success: true} );
      });
    }
  }));
});


module.exports = router;

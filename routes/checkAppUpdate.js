/**************************************************************************
* Author: Mahesh Kanna
* FileName: checkAppUpdate.js
* Description: Check for app update
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var router = express.Router();
var androidAppUpdates = require('../models/AndroidAppUpdates');


/* GET chart */
router.get('/', function(req, res, next) {
	androidAppUpdates.findOne({})
          .exec( function(err, app) {
          if (err) next(err);

          if (!app) {
            res.send({success: false});
          } else {
            res.send({androidVersion: app.androidVersion, androidAppVersion : app.androidAppVersion, androidAppUrl: app.androidAppUrl, timeStamp: app.timeStamp});
          }          	
    });
	
});

module.exports = router;

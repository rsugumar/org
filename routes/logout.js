 /**************************************************************************
* Author: Sukumar
* FileName: logout.js
* Description: Logout and clear the cookie.
* History:
*  Initial Release   25-Jan-2016
**************************************************************************/
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.get('/', function(req, res) {
  res.clearCookie('access_token');
  res.redirect('/auth');
});

module.exports = router;

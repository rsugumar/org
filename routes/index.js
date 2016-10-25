/**************************************************************************
* Author: Sukumar Raghavan
* FileName: index.js
* Description: Index file
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	//var baseURL = req.protocol + '://' + req.get('host');
  var employeeURL = "/user";
  var companyURL = "/company";
  var updateURL =  "/update";
  var orgChartURL = "/orgChart";
  var bulkRegistrationURL = "/bulkRegister";
	res.render('index', {	employeeURL: employeeURL,
							companyURL: companyURL,
							updateURL: updateURL,
							orgChartURL: orgChartURL,
							bulkRegistrationURL: bulkRegistrationURL });
});

module.exports = router;

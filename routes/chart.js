/**************************************************************************
* Author: Sukumar Raghavan
* FileName: chart.js
* Description: Organization chart request will be served here.
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var router = express.Router();

var server = require( '../server' );


/* GET chart */
router.get('/', function(req, res, next) {
      res.send ( server.orgCacheInstance.getOrgChartTree ( null ) );
});

router.get('/:id', function(req, res, next) {
      res.send ( server.orgCacheInstance.getOrgChartTree ( req.params.id ) );
});

module.exports = router;

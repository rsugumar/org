/**************************************************************************
* Author: Sukumar Raghavan
* FileName: server.js
* Description: Main file.
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var async = require('async');

var OrgCache = require('./cache/OrgCache');

//var sample = require('./populateSample.js');
//sample.populateCompanyDoc ( );
//sample.populateEmployeeDoc ( 3 );
//sample.populateOrgHierarchy ( );

var orgCache = new OrgCache ( );

async.series([
    function(callback) {
       function dbResultCb ( err, entries ) {
          orgCache.resultCallBack ( entries );
          callback ( );
       }
       orgCache.initialize ( dbResultCb );
    },
    function(callback) {
      orgCache.formTree ( );
      callback ( );
    }
]);


exports.orgCacheInstance = orgCache;

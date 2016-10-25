/**************************************************************************
* Author: Sukumar Raghavan
* FileName: setupGroupInfo.js
* Description: API to setup Group Info first time only.
* History:
*  Initial Release   01-April-2016
**************************************************************************/
var express = require('express');
var async = require('async');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('underscore');
var fs = require('fs');

var GroupMembersInfo = require('../models/GroupMembersInfoModel');

router.get('/', function(req, res, next) {

  var all = ['balaji.nagarajan@geokno.com',
		'palani.subramaniam@geokno.com',
		'muniya.krishnan@geokno.com',
		'gaurav.upadhyay@geokno.com',
		'shantanu.thakur@geokno.com',
		'vishnu.subbaiah@geokno.com',
		'ganeshan.gopalan@geokno.com',
		'thiru.gandhi@geokno.com',
		'tbk.babu@geokno.com',
		'suresh.venkat@geokno.com',
		'sundar.shunmugaraj@geokno.com',
		'surendra.kumar@geokno.com',
		'saraswathi.ramakrishna@geokno.com',
		'nagaraja.srinivas@geokno.com',
		'meenu.pappa@geokno.com',
		'antony.leon@geokno.com',
		'rajesh.kumar@geokno.com',
		'ravi.kumar@geokno.com',
		'mahesh.kumar@geokno.com'];

  var bdGroup = ['balaji.nagarajan@geokno.com',
                  'anbu.sebastian@geokno.com',
                  'ganeshan.gopalan@geokno.com',
                  'kesavaraj.sekar@geokno.com',
                  'palani.subramaniam@geokno.com',
                  'shantanu.thakur@geokno.com',
                  'sundar.shanmugaraj@geokno.com',
                  'tbk.babu@geokno.com',
                  'vishnu.subbaiah@geokno.com'];

  _.each(all, function(person) {
    var groupList = ['GeoknightsHR', 'GeoknoAdmin'];

    if (_.indexOf(bdGroup, person) > -1 ) {
      groupList.push('BusinessDevelopment');
      console.log(person + 'in BD - processing...');
    }
    var groupInfo = new GroupMembersInfo({
      groupMember: person,
      subscribedGroups: groupList
    });

    groupInfo.save(function(err) {
      if (err) {
        throw err;
      }
    });
  });

  res.send('Groups created successfully');
});


module.exports = router;

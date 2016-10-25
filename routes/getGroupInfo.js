/**************************************************************************
* Author: Sukumar Raghavan
* FileName: getGroupInfo.js
* Description: Group Info is served.
* History:
*  Initial Release   01-April-2016
**************************************************************************/
var express = require('express');
var async = require('async');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('underscore');
var fs = require('fs');

var GroupMembersInfoModel = require('../models/GroupMembersInfoModel');

router.get('/:_loginId', function(req, res, next) {
  GroupMembersInfoModel.findOne({groupMember: req.params._loginId})
                      .exec(function(err, result) {
    if(err) {
      throw err;
    }

    if (result) {
      var toSendJson = {'subscribedGroups': result.subscribedGroups};
      res.send(toSendJson);
    }
  });
});

module.exports = router;

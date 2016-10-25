/**************************************************************************
* Author: Sukumar Raghavan
* FileName: GroupMembersInfoModel.js
* Description: Company details are captured through this schema.
* History:
*  Initial Release   01-April-2016
**************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupMembersInfoSchema = new Schema({
  groupMember: String,
  subscribedGroups: [String]
  /*grpMembers: [{type: Schema.Types.ObjectId, ref: 'Employee'}]*/
}, { collection: 'GroupMembersInfo' });

module.exports = mongoose.model( 'GroupMembersInfo', GroupMembersInfoSchema );

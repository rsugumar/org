/**************************************************************************
* Author: Sukumar Raghavan
* FileName: UserAuth.js
* Description: This schema for user auth
* History:
* Initial Release   24-Jan-2016
**************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserAuthSchema = new Schema ({
   //objectID: Schema.ObjectId,
   emailid: String,
   password: String,
   isAdmin: Boolean
   }, { collection: 'UserAuth' } );

module.exports = mongoose.model ( 'UserAuth', UserAuthSchema );

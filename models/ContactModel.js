/**************************************************************************
* Author: Sukumar Raghavan
* FileName: ContactModel.js
* Description: This schema captures contact details.
*              It's used both in EmployeeModel and CompanyModel file.
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ContactSchema = new Schema ({
   objectID: Schema.ObjectId
 , isVisible: {type: Boolean, default: true }
 , homeNo: String
 , workNo: String
 , mobNo: String
 , emailId: String
}, { collection: 'Contact' } );

module.exports = mongoose.model ( 'Contact', ContactSchema );

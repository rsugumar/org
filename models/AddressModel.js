/**************************************************************************
* Author: Sukumar Raghavan
* FileName: AddressModel.js
* Description: This schema captures address details.
*              It's used both in EmployeeModel and CompanyModel file.
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AddressSchema = new Schema ({
   objectID: Schema.ObjectId
 , addressLine1: String
 , addressLine2: String
 , addressLine3: String
 , city: String
 , state: String
 , pinCode: Number
 , country: String
}, { collection: 'Address' } );

module.exports = mongoose.model ( 'Address', AddressSchema );

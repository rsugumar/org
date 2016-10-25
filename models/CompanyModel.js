/**************************************************************************
* Author: Sukumar Raghavan
* FileName: CompanyModel.js
* Description: Company details are captured through this schema.
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('./AddressModel');
require('./ContactModel');

var BranchSchema = new Schema ({
   branchId: Number
 , branchName: String
 , company: {type: Schema.Types.ObjectId, ref: 'Company'}
 , address: {type: Schema.Types.ObjectId, ref: 'Address'}
 , contacts: [{type: Schema.Types.ObjectId, ref: 'Contact'}]
}, { collection: 'Branch' } );

var CompanySchema = new Schema({
   companyID: Number
 , companyName: String
 , branches: [{type: Schema.Types.ObjectId, ref: 'Branch'}]
}, { collection: 'Company' } );

var DepartmentSchema = new Schema({
  departmentId: Number,
  departmentName: String,
  company: {type: Schema.Types.ObjectId, ref: 'Company'},
  branch: {type: Schema.Types.ObjectId, ref: 'Branch'}
}, { collection: 'Department' });

var DivisionSchema = new Schema({
  divisionId: Number,
  divisionName: String,
  department: {type: Schema.Types.ObjectId, ref: 'Department'},
}, { collection: 'Division' });


module.exports = {
   Branch:  mongoose.model ( 'Branch', BranchSchema ),
   Company: mongoose.model ( 'Company', CompanySchema )
   /*Department: mongoose.model ( 'Department', DepartmentSchema),
   Division: mongoose.model ( 'Division', DivisionSchema)*/
}

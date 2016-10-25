/***************************************************************************
* Author: Sukumar Raghavan
* FileName: EmployeeModel.js
* Description: Employee Schema file.
*              All details of employee are collected through this schema.
* History:
*  Initial Release   06-June-2015
***************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('./CompanyModel');
require('./AddressModel');
require('./ContactModel');

var EmpNameSchema = new Schema ({
   employee: {type: Schema.Types.ObjectId, ref: 'Employee'}
 , fName: String
 , mName: String
 , lName: String
}, { collection: 'EmpName' } );

var ProfilePixSchema = new Schema ({
   employee: {type: Schema.Types.ObjectId, ref: 'Employee'}
 , data: Buffer
 , fileType: String
 , fileSize: Number
}, { collection: 'ProfilePix' } );

var EmployeeModel = new Schema({
   empId: String
 , designation: String
 , skillSets: [String]
 , empName: { type: Schema.Types.ObjectId, ref: 'EmployeeName' }
 , company: { type: Schema.Types.ObjectId, ref: 'Company' }
 , branch: { type: Schema.Types.ObjectId, ref: 'Branch' }
 , department: String
 , division: String
 , address: { type: Schema.Types.ObjectId, ref: 'Address' }
 , contact: { type: Schema.Types.ObjectId, ref: 'Contact' }
 , profilePix: { type: Schema.Types.ObjectId, ref: 'ProfilePix' }
}, { collection: 'Employee' } );


module.exports = {
   Employee: mongoose.model ( 'Employee', EmployeeModel ),
   EmployeeName: mongoose.model ( 'EmployeeName', EmpNameSchema ),
   ProfilePix: mongoose.model ( 'ProfilePix', ProfilePixSchema )
}

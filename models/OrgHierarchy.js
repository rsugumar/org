/**************************************************************************
* Author: Sukumar Raghavan
* FileName: OrgHierarchy.js
* Description: OrgHierarchy schema
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('./EmployeeModel');

var OrgHierarchySchema = new Schema ({
   employee: { type: Schema.Types.ObjectId, ref: 'Employee' }
 , children: [ {type: Schema.Types.ObjectId, ref: 'Employee'} ]
 , parents: { type: Schema.Types.ObjectId, ref: 'Employee', default: null }

}, { collection: 'OrgHierarchy' } );


module.exports = mongoose.model('OrgHierarchy', OrgHierarchySchema);

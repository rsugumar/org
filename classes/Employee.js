//var ObjectID = require('mongodb').ObjectID;

var EmpName = require('./EmpName.js');
var Contact = require('./Contact.js');
var ProfilePix = require('./ProfilePix.js');

function Employee ( ) {
   //this._id = ObjectID;
   this._empId = 0;
   this._empName = EmpName;
   this._companyId = 0;
   this._contact = Contact;
   this._skillSets = [''];
   this._profilePix = ProfilePix;
}

Employee.prototype.getContacts = function ( ) {
}

module.exports = Employee;

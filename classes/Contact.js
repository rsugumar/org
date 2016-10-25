var util = require ('util');

function ContactBase ( ) {
   this._isVisible = true;
}

function Contact ( ) {
   ContactBase.apply ( this );
   //this._empObjId = ObjectID;
   this._empId = 0;
   this._homeNo = '';
   this._workNo = '';
   this._mobNo = '';
   this._emailId = '';
}

util.inherits ( Contact, ContactBase );
module.exports = Contact;

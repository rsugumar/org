var AddressDetails = require('./AddressDetails.js'),
    Contact = require('./Contact.js');

function BranchDetails ( ) {
   this._branchId = 0;
   this._address = AddressDetails;
   this._contacts = [Contact];
}

module.exports = BranchDetails;

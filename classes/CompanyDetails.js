var BranchDetails = require('./BranchDetails.js');

function CompanyDetails ( ) {
   this._companyId = 0;
   this._companyName = '';
   this._branches = [BranchDetails];
   this._companyURL = url('');
}

module.exports = CompanyDetails;

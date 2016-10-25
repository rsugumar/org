/**************************************************************************
* Author: Sukumar Raghavan
* FileName: populateSample.js
* Description: Sample DB populate file
* History:
*  Initial Release   06-June-2015
***************************************************************************/
var fs = require ( 'fs' );

var CompanyModel = require('./models/CompanyModel');
var EmployeeModel = require('./models/EmployeeModel');
var Address = require('./models/AddressModel');
var Contact = require('./models/ContactModel');
var OrgHierarchy = require('./models/OrgHierarchy');

var emp = new EmployeeModel.Employee ( );
var empName = new EmployeeModel.EmployeeName ( );
var profilePix = new EmployeeModel.ProfilePix ( );
var empContact = new Contact ( );
var empAddress = new Address ( );

var companyAddress = new Address ( );
var companyContact = new Contact ( );
var branch = new CompanyModel.Branch ( );
var company = new CompanyModel.Company ( );

function populateCompanyDoc ( ) {
   companyAddress.objectID = branch._id;
   companyAddress.street = 'StreetName';
   companyAddress.area = 'AreaName';
   companyAddress.city = 'CityName';
   companyAddress.state = 'StateName';
   companyAddress.country = 'CountryName';

   companyContact.objectID = branch._id;
   companyContact.workNo = '1234567890';
   companyContact.mobNo = '1234567890';
   companyContact.emailId = 'sukumar@abc.com';

   branch.branchId = 123;
   branch.branchName = 'BranchName';
   branch.company = company._id;
   branch.address = companyAddress._id;
   branch.contacts = companyContact._id;

   company.companyID = 111;
   company.companyName = 'CompanyName';
   company.branches.push ( branch );

   CompanyModel.Company.findOne( {'companyID': company.companyID},
                                 function ( err, foundCompany ) {
         if ( err ) {
            console.log ( 'Err occurred' );
         } else {
            if ( !foundCompany ) {
               companyAddress.save ( );
               branch.save ( );
               companyContact.save ( );
               company.save ( );
            } else {
               emp.company = foundCompany._id;
               emp.branch = foundCompany.branches[0];
               console.log ( 'Document ALREADY found with COMPANY_ID: ',
                             company.companyID );
               console.log ( 'NOT Creating document...', company.companyID );
            }
         }
   });
}

function populateEmployeeDoc ( empId ) {
   console.log ( 'Invoking for i = ', empId );
   var Emp_ = 'Emp_'
   var suffix = '_FName'
   empName.fName = Emp_ + empId + suffix;
   suffix = '_MName';
   empName.mName = Emp_ + empId + suffix;
   suffix = '_LName';
   empName.lName = Emp_ + empId + suffix;
   empName.employee = emp._id;

   empContact.objectID = emp._id;
   empContact.workNo = '1234567890';
   empContact.mobNo = '1234567890';
   empContact.emailId = 'sukumar@abc.com';

   empAddress.objectID = emp._id;
   empAddress.street = 'StreetName';
   empAddress.area = 'AreaName';
   empAddress.city = 'CityName';
   empAddress.state = 'StateName';
   empAddress.country = 'CountryName';

   profilePix.employee = emp._id;
   profilePix.data = fs.readFileSync ( '/home/rsukumar/Pictures/GOT.jpg' );
   profilePix.fileType = 'jpg';
   profilePix.fileSize = profilePix.data.length;

   emp.empId = empId;
   emp.designation = 'ceo' + empId;
   emp.skillSets = ['skill1', 'skill2', 'skill3'];
   emp.empName = empName._id;
   emp.company = company._id;
   emp.branch = branch._id;
   emp.contact = empContact._id;
   emp.address = empAddress._id;
   emp.profilePix = profilePix._id;

   EmployeeModel.Employee.find( {'empId': emp.empId}, function ( err, entry ) {
         if ( err ) {
            console.log ( 'Err occurred' );
         } else {
            if ( !entry.length ) {
               empName.save ( );
               empContact.save ( );
               empAddress.save ( );
               profilePix.save ( );
               emp.save ( );
            } else {
               console.log ( 'Document ALREADY found with EmpID: ',
                  emp.empId );
               console.log ( 'NOT Creating document...', emp.empId );
            }
         }
   });
}

function populateOrgHierarchy ( ) {
   var mongoose = require('mongoose');
   var employeeObj = mongoose.Types.ObjectId("5578341580a39dc829208a45");
   var child1 = mongoose.Types.ObjectId("55783429947a36d429b79d11");
   var child2 = mongoose.Types.ObjectId("5578342eebb279e0297ba16e");
   var orgHierarchy = new OrgHierarchy ( );
   orgHierarchy.employee = employeeObj;
   orgHierarchy.children = new Array ( );
   orgHierarchy.children.push ( child1 );
   orgHierarchy.children.push ( child2 );
   orgHierarchy.save ( );
}

module.exports = {
   populateCompanyDoc: populateCompanyDoc,
   populateEmployeeDoc: populateEmployeeDoc,
   populateOrgHierarchy: populateOrgHierarchy
}

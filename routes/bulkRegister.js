var express = require('express');
var router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId; 
const fs = require('fs');

var Excel = require('exceljs');
var async = require('async');

var Address = require('../models/AddressModel');
var Contact = require('../models/ContactModel');
var EmployeeModel = require('../models/EmployeeModel');
var Employee = require('../models/EmployeeModel').Employee;
var ProfilePix = require('../models/EmployeeModel').ProfilePix;
var EmpName = require('../models/EmployeeModel').EmployeeName;
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;
var OrgHierarchy = require('../models/OrgHierarchy');

var server = require( '../server' );

var branchCacheList = server.orgCacheInstance.getBranchList();

//localhost:3000/bulkRegister
router.get('/', function(req, res) {
  res.render('bulkRegister');
});


//localhost:3000/bulkRegister/import
router.post('/import', function(req, res){	
	branchCacheList = server.orgCacheInstance.getBranchList();

	var headerArray = ['','Employee Id','Email Id','First Name','Middle Name','Last Name','Designation',
	'Address Line 1','Address Line 2','Address Line 3','City','State','Country','Pin Code','Mobile Number','Work Number','Home Number',
	'Branch Id'];
	var workBook = new Excel.Workbook();
	workBook.xlsx.readFile(req.files.employeeDetails.path)
    .then(function() {
        var workSheet = workBook.getWorksheet('Employee Details');
        var headerMatchFlag = true;
        var resultOfOperation = [];

        //Create a queue to process the insert operation
    	var q = async.queue(function (rowValues, callback) {
		    var result = updateEmployeeDetails(rowValues.employeeDetails, callback);
		    if(result !== undefined && result !== null){
		    	resultOfOperation.push(result);
		    }
		    //callback();
		}, 2);

    	//Once all the procees in the queue
		q.drain = function() {
			
		    if(resultOfOperation.length === 0){
		    	server.orgCacheInstance.reinitializedbCache( function(){
		    		return res.redirect('/bulkRegister');
		    	});
		    	// server.orgCacheInstance.reinitializedbCache();
		    	// return res.redirect('/bulkRegister');		    		    	
		    }
		    else{		    	
			    return res.render('bulkRegister',{message: 'Following Employee Details were not processed: '+resultOfOperation});
		        
		    }
		    
		};

		//Iterate through each row of the excel
      	workSheet.eachRow(function(row, rowNumber) {
		    if(rowNumber === 1){ // for header
		    	var excelHeaderValues = row.values;		    	
		    	for(var i=1;i<excelHeaderValues.length;i++){
		    		if(excelHeaderValues[i] !== headerArray[i]){
		    			headerMatchFlag = false;
		    			break;
		    		}
		    	}
		    	if(!headerMatchFlag){
		    		return res.render('bulkRegister',{message: 'Invalid Template! Maintain the order of the columns'});	    
		    	}
		    }
		    else if(headerMatchFlag){
		    	//Push the employee details to be processed in a queue
				q.push({employeeDetails : row.values}, function (err) {
				    //console.log("Processed Employee Details."+err);				    
				});
		    }
		    
		});
    });

});

//localhost:3000/bulkRegister/downloadTemplate
router.get('/downloadTemplate', function(req, res){
	//Create a workbook and a sheet to it
	var workBook = new Excel.Workbook();
	var workSheet = workBook.addWorksheet('Employee Details');

	// Define the column headers of the excel sheet
	workSheet.columns = [
	    { header: 'Employee Id', key: 'EmployeeID', width: 20 },
	    { header: 'Email Id', key: 'EmployeeEmailId', width: 50 },
	    { header: 'First Name', key: 'EmployeeFirstName', width: 20 },
	    { header: 'Middle Name', key: 'EmployeeMiddleName', width: 20 },
	    { header: 'Last Name', key: 'EmployeeLastName', width: 20 },
	    { header: 'Designation', key: 'EmployeeDesignation', width: 20 },
	    { header: 'Address Line 1', key: 'EmployeeAdressL1', width: 20 },
	    { header: 'Address Line 2', key: 'EmployeeAdressL2', width: 20 },
	    { header: 'Address Line 3', key: 'EmployeeAdressL3', width: 20 },
	    { header: 'City', key: 'EmployeeCity', width: 20 },
	    { header: 'State', key: 'EmployeeState', width: 20 },
	    { header: 'Country', key: 'EmployeeCountry', width: 20 },
	    { header: 'Pin Code', key: 'EmployeePinCode', width: 20 },
	    { header: 'Mobile Number', key: 'EmployeeMobNo', width: 20 },
	    { header: 'Work Number', key: 'EmployeeWorkNo', width: 20 },
	    { header: 'Home Number', key: 'EmployeeHomeNo', width: 20 },
	    { header: 'Branch Id', key: 'EmployeeBranchId', width: 20 }
	];

	var branchList = server.orgCacheInstance.getBranchList(); 

	// Form the data validation formula for branch id
	var branchListUniqueIdsString = '\"';
	for(var i=0;i<branchList.length;i++){
		var b = branchList[i];
		
		if(i+1 === branchList.length){
			branchListUniqueIdsString = branchListUniqueIdsString+b.BranchID+'\"';
		}
		else{
			branchListUniqueIdsString = branchListUniqueIdsString+b.BranchID+',';
		}
		
	}
	var branchListUniqueIdsArray = [];
	branchListUniqueIdsArray.push(branchListUniqueIdsString);

	 //Color the column headers
    workSheet.getRow(1).fill = {
	    type: 'pattern',
	    pattern:'solid',
	    fgColor:{argb:'FFFFFF00'},
	    bgColor:{argb:'FF0000FF'}
	};

	workSheet.getCell('Q2').dataValidation = {
	    type: 'list',
	    allowBlank: true,
	    formulae: branchListUniqueIdsArray
	};
 

    var downloadFileName = 'EmployeeDetails Bulk Register Template.xlsx';
    workBook.xlsx.writeFile(downloadFileName)
    .then(function() {
        console.log("Excel ready to download"); 
        res.download(downloadFileName);
    });

});


//localhost:3000/bulkRegister/export
router.get('/export', function(req, res){
	//Create a workbook and a sheet to it
	var workBook = new Excel.Workbook();
	var workSheet = workBook.addWorksheet('Employee Details');

	// Define the column headers of the excel sheet
	workSheet.columns = [
	    { header: 'Employee Id', key: 'EmployeeID', width: 20 },
	    { header: 'Email Id', key: 'EmployeeEmailId', width: 50 },
	    { header: 'First Name', key: 'EmployeeFirstName', width: 20 },
	    { header: 'Middle Name', key: 'EmployeeMiddleName', width: 20 },
	    { header: 'Last Name', key: 'EmployeeLastName', width: 20 },
	    { header: 'Designation', key: 'EmployeeDesignation', width: 20 },
	    { header: 'Address Line 1', key: 'EmployeeAdressL1', width: 20 },
	    { header: 'Address Line 2', key: 'EmployeeAdressL2', width: 20 },
	    { header: 'Address Line 3', key: 'EmployeeAdressL3', width: 20 },
	    { header: 'City', key: 'EmployeeCity', width: 20 },
	    { header: 'State', key: 'EmployeeState', width: 20 },
	    { header: 'Country', key: 'EmployeeCountry', width: 20 },
	    { header: 'Pin Code', key: 'EmployeePinCode', width: 20 },
	    { header: 'Mobile Number', key: 'EmployeeMobNo', width: 20 },
	    { header: 'Work Number', key: 'EmployeeWorkNo', width: 20 },
	    { header: 'Home Number', key: 'EmployeeHomeNo', width: 20 },
	    { header: 'Branch Id', key: 'EmployeeBranchId', width: 20 },
	    { header: 'Branch Name', key: 'EmployeeBranchName', width: 20 }
	];

	var employeeList = server.orgCacheInstance.getEmployeeList(); 
	var branchList = server.orgCacheInstance.getBranchList(); 

	// Form the data validation formula for branch id
	var branchListUniqueIdsString = '\"';
	for(var i=0;i<branchList.length;i++){
		var b = branchList[i];
		
		if(i+1 === branchList.length){
			branchListUniqueIdsString = branchListUniqueIdsString+b.BranchID+'\"';
		}
		else{
			branchListUniqueIdsString = branchListUniqueIdsString+b.BranchID+',';
		}
		
	}
	var branchListUniqueIdsArray = [];
	branchListUniqueIdsArray.push(branchListUniqueIdsString);

	// Insert the employee list as rows to the sheet
    for(var i=0;i<employeeList.length;i++){
    	var e = employeeList[i];
    	workSheet.addRow(e);        
    }

    //Color the column headers
    workSheet.getRow(1).fill = {
	    type: 'pattern',
	    pattern:'solid',
	    fgColor:{argb:'FFFFFF00'},
	    bgColor:{argb:'FF0000FF'}
	};

	workSheet.getCell('Q2').dataValidation = {
	    type: 'list',
	    allowBlank: true,
	    formulae: branchListUniqueIdsArray
	};
 

    var downloadFileName = 'EmployeeDetails Bulk Register.xlsx';
    workBook.xlsx.writeFile(downloadFileName)
    .then(function() {
        console.log("Excel ready to download"); 
        res.download(downloadFileName);
    });

	
});


// updates the employee details in the DB
function updateEmployeeDetails(data, callBack){
	if(data === undefined || data === null){
		return;
	}

	var emp = new Employee ( );
  	var empName = new EmployeeModel.EmployeeName( );
  	var empContact = new Contact ( );
  	var empAddress = new Address ( );
  	var orgHierarchy = new OrgHierarchy();

  	empName.fName = data[3];
  	empName.mName = data[4];
  	empName.lName = data[5];
  	empName.employee = emp._id;

  	empContact.objectID = emp._id;
  	empContact.workNo = data[15];
  	empContact.mobNo = data[14];
  	empContact.emailId = data[2];
  	empContact.homeNo = data[16];

  	empAddress.objectID = emp._id;
  	empAddress.addressLine1 = data[7];
  	empAddress.addressLine2 = data[8];
  	empAddress.addressLine3 = data[9];
  	empAddress.city = data[10];
  	empAddress.pinCode = data[13];
  	empAddress.state = data[11];
  	empAddress.country = data[12];

  	orgHierarchy.employee = emp._id;

  	emp.empId = data[1];
  	emp.designation = data[6];


  	emp.empName = empName._id;
    emp.contact = empContact._id;
    emp.address = empAddress._id;
    emp.branch = null;

    var branchIdForUpdate = null;
    if(data[17] !== null){
    	 for(var i=0;i<branchCacheList.length;i++){
    	 	var branchObject = branchCacheList[i];
	    	if(data[17] === branchObject.BranchID){
	    		emp.branch = branchObject.BranchOjectId;
	    		branchIdForUpdate = branchObject.BranchOjectId;
	    	}
	    }
    }
    else{
    	emp.branch = branchCacheList[0].BranchOjectId;
    }

    Contact.findOne({"emailId": data[2]},  function(err, employeeContactDetails){
	    	if (err) errorHandler(data[2]);
	    	//If cannot find employee details insert the employee details, else update it
	    	if(!employeeContactDetails){
	    	   empName.save();
	           empContact.save();
	           empAddress.save();
	           orgHierarchy.save();
	           emp.save();
	           callBack();
	    	}
	    	else{
	    		//Find the employee details and update it
	    		Employee.findOne({"contact": new ObjectId(employeeContactDetails['_id']).toString()},  function(err, employee){

	    			if (err) return errorHandler(data[2]);

	    			var empNameId = employee.empName;
		    		var empAddressId = employee.address;	    		
		    		var empContactId = employee.contact;
		    		var branchId = employee.branch;

		    		
		    		// Update Employee Name collection
		    		var updateFields = { fName:data[3], mName: data[4], lName: data[5] };
		    		EmpName.findOneAndUpdate({'_id': new ObjectId(empNameId).toString() }, updateFields, function(err, doc){
					    if (err) errorHandler(data[2]);				   
					});

					// Update Employee Address collection
					updateFields = { addressLine1: data[7], addressLine2: data[8], addressLine3: data[9],  city: data[10], pinCode: data[13], state: data[11],  country: data[12] };
		    		Address.findOneAndUpdate({'_id': new ObjectId(empAddressId).toString() }, updateFields, function(err, doc){
					    if (err) errorHandler(data[2]);
					});

					// Update Employee Name collection
					updateFields = { workNo: data[15], mobNo:  data[14], emailId: data[2], homeNo: data[16] };
		    		Contact.findOneAndUpdate({'_id': new ObjectId(empContactId).toString()  }, updateFields, function(err, doc){
					    if(empContact.emailId === 'balaji.nagarajan@geokno.com'){
					    	console.log("Found");
					    }
					    if (err) errorHandler(data[2]);
					});

	    			// Update Employee Details collection
	    			updateFields = { empId: data[1], designation: data[6], branch: branchIdForUpdate};
					Employee.findOneAndUpdate({'_id': new ObjectId(employee['_id']).toString()}, updateFields, function(err, doc){
					    if (err) errorHandler(data[2]);
					    callBack();
					});	
	    		});
	    		
	    	}
	    });	

		function errorHandler(employeeId){
    		return employeeId;
    	}
    		

}

module.exports = router;
/**************************************************************************
* Author: Sukumar Raghavan
* FileName: OrgCache.js
* Description: Organization DB Cache.
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var async = require ('async');
var _ = require('underscore');

var express = require('express');
var arrayList = require('arraylist');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;


var CompanyModel = require('../models/CompanyModel');
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;
var Address = require('../models/AddressModel');
var Employee = require('../models/EmployeeModel').Employee;
var Contact = require('../models/ContactModel');


var companyList = new arrayList;
var branchList = new arrayList;
var dbQueryList = new arrayList;
var employeeList = new arrayList;
var compBranchList = {};
var compBranchIdList = {};

var dbIntialize = function ( callBack ){ 

   var compBranQuery = function ( callback ) {
   	Company.find ( {}, 'companyName branches' )
   		.populate ( 'branches' )
   		.exec ( function ( err, result ) {
   		    _.each ( result, function ( entry ) {
   		        compBranchList[entry.companyName] = [];
   		        _.each ( entry.branches, function ( branch ) {
   		        	compBranchList[entry.companyName].push (branch.branchName );
   		        });
   	    	});

   	    	callback ( );

   		});
   }

   var compBranIdQuery = function ( callback ) {
         Company.find ( {}, 'companyName branches companyID' )
   		.populate ( 'branches' )
   		.exec ( function ( err, result ) {
   			_.each ( result, function ( entry ) {
   			    compBranchIdList[entry.companyID] = [];
   			    _.each ( entry.branches, function ( branch ) {
   			        compBranchIdList[entry.companyID].push (branch.branchId );
   			    });
   			});

   			callback ( );
   		});
   }

   var companyQuery = function ( callback ) {
         Company.find ( {}, 'companyName companyID branches' )
                .populate ( 'branches' )
                .exec ( function ( err, result ) {
                   _.each ( result, function ( entry ) {
   	                companyList.push ({ CompanyName: entry.companyName, CompanyID: entry.companyID, Branches: [entry.branches] } )  ;
                   });
   	            callback();
                   });
   }

   var branchQuery = function ( callback ) {
         Branch.find ( {}, 'branchName company branchId address contacts' )
                .populate ( 'contacts address company' )
                .exec ( function ( err, result ) {
                   _.each ( result, function ( entry ) {
   	                branchList.push ( {BranchOjectId: entry._id, BranchName: entry.branchName, BranchID: entry.branchId, companyDetails: entry.company, Address: entry.address, Contacts: [entry.contacts]} );
                   });
   	            callback();
                });
   }


   var EmployeeQuery = function ( callback ) {
   	Employee.find ( {}, 'empName designation empId branch address contact' )
   		.populate ( 'empName branch address contact' )
   		.exec ( function ( err, result ) {
   		_.each ( result, function ( entry ) {
   		    employeeList.push ( { EmployeeFirstName: entry.empName.fName,
                                   EmployeeLastName: entry.empName.lName,
                                   EmployeeMiddleName: entry.empName.mName,
                                   EmployeeID: entry.empId,
                                   EmployeeDesignation: entry.designation,
                                   EmployeeSkillSet: entry.skillSets,
                                   EmployeeAdressL1: entry.address.addressLine1,
                                   EmployeeAdressL2: entry.address.addressLine2,
                                   EmployeeAdressL3: entry.address.addressLine3,
                                   EmployeeCity: entry.address.city,
                                   EmployeeState: entry.address.state,
                                   EmployeePinCode: entry.address.pinCode,
                                   EmployeeCountry: entry.address.country,
                                   EmployeeContactIsVissible: entry.contact.isVisible,
                                   EmployeeHomeNo: entry.contact.homeNo,
                                   EmployeeWorkNo: entry.contact.workNo,
                                   EmployeeMobNo: entry.contact.mobNo,
                                   EmployeeEmailId: entry.contact.emailId,
                                   EmployeeBranchId: entry.branch.branchId,
                                   EmployeeBranchName: entry.branch.branchName
                                 });
   		});
   		callback();
   	});
   }

   dbQueryList.push ( companyQuery );
   dbQueryList.push ( branchQuery ) ;	
   dbQueryList.push ( EmployeeQuery );
   dbQueryList.push ( compBranQuery );
   dbQueryList.push ( compBranIdQuery );


   async.parallel (dbQueryList, function ( callback ) {
     	console.log ( 'Got in time: \nCompanyFinalList: ', companyList );
         console.log ( 'BranchFinalList: ', branchList );
         console.log (' EmployeeFinalList: ', employeeList );
     	console.log (' company and branch List : ', compBranchList );
         console.log('company and branch Id List', compBranchIdList);
        if(callBack !== undefined){
          callBack();
        }        
       
   });
}

dbIntialize ();

OrgCache.prototype.reinitializedbCache = function(callBack) {
   
   companyList = [];
   branchList = [];
   dbQueryList = [];
   employeeList = [];
   compBranchList= {};
   compBranchIdList = {};

   var dbList = [];

     dbIntialize(callBack);

   // dbList.push ( dbIntialize );

   // async.series(dbList, function (){
   //    console.log('reinitializing ! ')
   // });
   
};


function OrgCache ( ) {
   this._cache = [];
   this._finalTree = {};
   this._employeeList = new arrayList;
   this._branchList = new arrayList;
   this._companyList = new arrayList;
   this._compBranchList = new arrayList;
   this._compBranchIdList = new arrayList;
}



OrgCache.prototype.getEmployeeList = function ( ) {
   this._employeeList = employeeList;
   return this._employeeList;
}


OrgCache.prototype.getBranchList = function ( ) {
   this._branchList = branchList;
   return this._branchList;
}

OrgCache.prototype.getCompBranchList = function ( ) {
   this._compBranchList = compBranchList;
   return this._compBranchList;
}

OrgCache.prototype.getCompBranchIDList = function ( ) {
   this._compBranchIdList = compBranchIdList;
   return this._compBranchIdList;
}

OrgCache.prototype.getCompanyList = function ( ) {
   this._companyList = companyList;
   return this._companyList;
}

OrgCache.prototype.getOrgChartTree = function ( name ) {
   var result = {};
   if ( name == null ) {
      result = this._finalTree;
   } else {
      function handleResultCb ( resultJson ) {
         result = resultJson;
      }

      function getOrgChartSubTree ( needle, lookupTree, cb ) {
         if ( lookupTree._id == needle ) {
            cb ( lookupTree );
            return;
         } else {
            if ( !lookupTree.hasOwnProperty('children') ) {
               return;
            }
            for ( var i = 0; i < lookupTree.children.length; i++ ) {
               getOrgChartSubTree ( name, lookupTree.children[i], cb );
            }
         }
      }
      getOrgChartSubTree ( name, this._finalTree, handleResultCb );
   }
   return result;
}

OrgCache.prototype.resultCallBack = function ( entries ) {
   if ( entries == null || !entries.length ) {
       console.log ( 'No entries are available!' );
       return;
   }

   delete this._cache;
   delete this._finalTree;
   this._cache = [];
   this._finalTree = {};

   for ( var i = 0; i < entries.length; i++ ) {
      this._cache.push ( entries[i] );
   }
}

OrgCache.prototype.initialize = function ( afterResultCb ) {
   console.log( 'Initializing...');
   queryOrgHierarchy ( afterResultCb );
}

OrgCache.prototype.reInitialize = function ( ) {
   var obj = this;
   function dbResultCb ( err, entries ) {
      obj.resultCallBack ( entries );
      obj.formTree ( );
   }
   this.initialize ( dbResultCb );
}

function identifyRoot ( fullList ) {
   var root = {};
   for ( var i = 0; i < fullList.length; i++ ) {
      if ( !fullList[i].parents ) {
         root = fullList[i];
         //delete fullList[i];
         break;
      }
   }
   return root;
}

function cloneObj ( obj ) {
   var retObj = (JSON.parse ( JSON.stringify ( obj ) ) );
   return retObj;
}

function formNode ( nodeVal ) {
   if ( nodeVal.employee == null ) {
      return;
   }

   var emptyNodeElem = { _id: '', emp_id: 0, name: '',fname: '', lname: '', designation: '', email: '', mobile_number: '', address: '', profilepix_suffix: '',children: [] };
   var returnNodeElem = cloneObj ( emptyNodeElem );
   // Add attributes for employee here as needed
   returnNodeElem._id = nodeVal.employee._id;
   returnNodeElem.emp_id = nodeVal.employee.empId;
   returnNodeElem.name = nodeVal.employee.empName.fName;
   returnNodeElem.fname = nodeVal.employee.empName.fName;
   returnNodeElem.lname = nodeVal.employee.empName.lName;
   returnNodeElem.name += nodeVal.employee.empName.lName;
   returnNodeElem.designation = nodeVal.employee.designation;
   returnNodeElem.email = nodeVal.employee.contact.emailId;
   returnNodeElem.address = nodeVal.employee.address.addressLine1 + ", ";
   returnNodeElem.address += nodeVal.employee.address.addressLine2 + ", ";
   returnNodeElem.address += nodeVal.employee.address.addressLine3;
   returnNodeElem.mobile_number = nodeVal.employee.contact.mobNo;
   returnNodeElem.profilepix_suffix = nodeVal.employee._id + "/profilePix";
   for ( var i = 0; i < nodeVal.children.length; i++ ) {
      var newNodeElem = cloneObj ( emptyNodeElem );
      // Add attributes for employee here as needed
      newNodeElem._id = nodeVal.children[i]._id;
      newNodeElem.emp_id = nodeVal.children[i].empId;
      newNodeElem.name = nodeVal.children[i].empName.fName;
      newNodeElem.fname = nodeVal.children[i].empName.fName;
      newNodeElem.lname = nodeVal.children[i].empName.lName;
      newNodeElem.name += nodeVal.children[i].empName.lName;
      newNodeElem.designation = nodeVal.children[i].designation;
      newNodeElem.email = nodeVal.children[i].contact.emailId;
      newNodeElem.address = nodeVal.children[i].address.addressLine1 + ", ";
      newNodeElem.address += nodeVal.children[i].address.addressLine2 + ", ";
      newNodeElem.address += nodeVal.children[i].address.addressLine3;
      newNodeElem.mobile_number = nodeVal.children[i].contact.mobNo;
      newNodeElem.profilepix_suffix = nodeVal.children[i]._id + "/profilePix";
      returnNodeElem.children.push ( newNodeElem );
   }
   return returnNodeElem;
}

OrgCache.prototype.formTree = function ( ) {
   var preparedList = [];
   //preparedList.push ( finalNode );
   for ( var i = 0; i < this._cache.length; i++ ) {
      var newestNode = formNode ( this._cache[i] );
      preparedList.push ( newestNode );
   }
   var rootNode = identifyRoot ( this._cache );
   var finalNode = formNode ( rootNode );
   constructBigTree ( finalNode, preparedList );
   this._finalTree = finalNode;
   return finalNode;
}

function constructBigTree ( bigTree, preparedList ) {
   if ( bigTree == null || bigTree == undefined ) {
      return;
   }

   var childNodes = getChild ( bigTree._id, preparedList );
   if ( childNodes.length > 0 ) {
      bigTree.children = childNodes;
      for ( var i = 0; i < bigTree.children.length; i++ ) {
         constructBigTree ( bigTree.children[i], preparedList );
      }
   } else {
      delete bigTree.children;
   }
}

function getChild ( nodeId, nodeList ) {
   var emptyNodeElem = { _id: '', node: '', children: [] };
   var retChildNode = cloneObj ( emptyNodeElem );
   for ( var i = 0; i < nodeList.length; i++ ) {
      if ( nodeList[i]._id.toString( ) === nodeId.toString() ) {
         retChildNode = nodeList[i].children;
         retChildNode.node = nodeList[i].node;
         break;
      }
   }

   return retChildNode;
}

OrgCache.prototype.getParentObjId = function ( nodeId ) {
   var retVal = '';
   for ( var i = 0; i < this._cache.length; i++ ) {
      retVal = _.find ( this._cache[i].children, function ( objectId ) {
            objectId.toString ( ) === nodeId.toString ( );
      } );

      if ( retVal != undefined ) {
         break;
      }
   }

   return retVal;
}

function queryOrgHierarchy ( cb ) {
   var orgHierarchyModel = require('../models/OrgHierarchy');
   orgHierarchyModel.find ( ).
      populate ( 'employee parents children' ).
      exec ( function ( err, res ) {
         var options = [
            {
               path: 'employee.empName',
               select: 'fName mName lName',
               model: 'EmployeeName'
            },
            {
               path: 'parents.empName',
               select: 'fName mName lName',
               model: 'EmployeeName'
            },
            {
               path: 'children.empName',
               select: 'fName mName lName',
               model: 'EmployeeName'
            },
            {
               path: 'employee.address',
               select: {addressLine1: 1,
                        addressLine2: 1,
                        addressLine3: 1,
                        city:1,
                        state:1,
                        country:1,
                        _id:0},
               model: 'Address'
            },
            {
               path: 'employee.contact',
               select: {emailId: 1, mobNo: 1, workNo: 1, _id: 0},
               model: 'Contact'
            },
			{
			path: 'children.address',
			select: {addressLine1: 1,
		             addressLine2: 1,
		             addressLine3: 1,
		             city: 1,
		             state: 1,
		             country: 1,
		             _id: 0},
		           model: 'Address'
			},
			{
			path: 'children.contact',
		           select: {emailId: 1,
							mobNo: 1,
							workNo: 1,
							_id: 0},
		           model: 'Contact'
	   	    }
         ]
         orgHierarchyModel.populate ( res,
                                      options,
                                      cb );
   } );
}

module.exports = OrgCache;

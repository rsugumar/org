var express = require('express');
var router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId; 
var async = require('async');
var server = require( '../server' );

var Address = require('../models/AddressModel');
var Contact = require('../models/ContactModel');
var EmployeeModel = require('../models/EmployeeModel');
var Employee = require('../models/EmployeeModel').Employee;
var ProfilePix = require('../models/EmployeeModel').ProfilePix;
var EmpName = require('../models/EmployeeModel').EmployeeName;
var Company = require('../models/CompanyModel').Company;
var Branch = require('../models/CompanyModel').Branch;
var OrgHierarchy = require('../models/OrgHierarchy');
var RelationShip = require('../models/RelationShip');

var branchCacheList = server.orgCacheInstance.getBranchList();

//localhost:3000/orgChart
router.get('/', function(req, res) {
  res.render('orgChart');
});

//get all unassigned users
router.get('/users/allUnassignedUsers', function(req, res){
	server.orgCacheInstance.initialize(function(dump, options){
		var unAssignedUsers = [];
		if(options !== null &  options !==undefined){
			for(var i=0;i<options.length;i++){
				var object = options[i];
				if(object.parents === null && object.employee !== null && object.employee !== undefined){
					object._doc.id = object.employee.contact.emailId;
          object._doc.employeeObjectId = object.employee._id;
          object._doc.address = object.employee.address;
          object._doc.contact = object.employee.contact;
          object._doc.empName = object.employee.empName;
          object._doc.skillSets = object.employee.skillSets;
          object._doc.designation = object.employee.designation;
          object._doc.empId = object.employee.empId; 
					object._doc.columns = [[]];
					unAssignedUsers.push(object);
				}
			}
			res.json({
					type: true,
					data: unAssignedUsers
			});
		}
		else{
			res.json({
					type: true,
					data: []
			});
		}
		
	});

});

//Update organization chart
function updateOrgChart(req, callBack){
     // var relationShip = new RelationShip();
     //            relationShip.relationMap = [];
     //            relationShip.save();

    var count = 0;
    async.whilst(
	    function () { return count < Object.keys(req.body).length; },
	    function (callback) {
          var parentValue = Object.keys(req.body)[count];
          if(parentValue !== undefined && parentValue !== null){
              // var innerColumn = [];
              // innerColumn.push([]);
              // for(var k=0; k<req.body[parentValue].length;k++){
              //   innerColumn[0].push(ObjectId(req.body[parentValue][k]));
              // }
              
              //find the parent
              OrgHierarchy.findOneAndUpdate({'employee': ObjectId(parentValue)},
               { 
                 $push: { children: { $each : req.body[parentValue]} } 
               }, {upsert: true},
               function(err, object) {
                  if (err) {
                  } 
                  else{ 
                    for(var i=0;i < req.body[parentValue].length; i++){
                      var objectId = req.body[parentValue][i];
                       OrgHierarchy.findOneAndUpdate({'employee': ObjectId(objectId)},
                       { 
                          parents: ObjectId(parentValue)
                       }, function(err, object){
                          if(err){
                            console.log("Error"+err);
                          }
                       });
                    }
                                      
                    count++;
                    callback(null, count);
                  } 
               });
          }	         
	    },
	    function (err, n) {
	        callBack(null, true);
	    }
	);


   // // RelationShip.findOneAndUpdate({},{  relationMap:[] },{ upsert: true });
   //  for(var parentValue in req.body){
   //      console.log(parentValue+": "+req.body[parentValue]);
   //      //Insert the relation ship
   //       //RelationShip.update({},{ $push: { relationMap:req.body[parentValue] }});
   //       OrgHierarchy.findOneAndUpdate({ id: parentValue },
   //           { 
   //              children: req.body[parentValue]
   //           }, 
   //           function(err, user) {
   //               if (err) {
   //              } 
   //               else{
   //               } 
   //           });
   //  }
}

// update the relationships
router.post('/users/updateOrgTree', function(req, res) {
  
    async.series([function(callback){
        updateOrgChart(req, callback);
      }], function(err, result){
  	    if(result[0] === true){
  	    	 res.json({
                          type: true,
                          message: "Org chart saved successfully"
          	}); 
  	    }
  	    else{
  	    	res.json({
                          type: false,
                          message: "Error while saving"
          	}); 

  	    }
  	});
      
});

//get the org chart
router.get('/users/getOrgChartTree', function(req, res){
  server.orgCacheInstance.initialize(function(dump, options){
    var assignedUsers = [];
    if(options !== null &  options !==undefined){
      for(var i=0;i<options.length;i++){
        var object = options[i];
        if(object.children.length !== 0 && object.employee !== null && object.employee !== undefined){
          object._doc.id = object.employee.contact.emailId;
          object._doc.employeeObjectId = object.employee._id;
          object._doc.address = object.employee.address;
          object._doc.contact = object.employee.contact;
          object._doc.empName = object.employee.empName;
          object._doc.skillSets = object.employee.skillSets;
          object._doc.designation = object.employee.designation;
          object._doc.empId = object.employee.empId;          

          object._doc.columns = [object.children];
          for(var j=0; j < object._doc.columns[0].length; j++){
            var childObject = object._doc.columns[0][j];
            childObject._doc.employeeObjectId = childObject._id;
            childObject._doc.columns = [[]];         
          }
          assignedUsers.push(object);
        }
      }

      var relationShipObject = [];
      for(var i=0; i < assignedUsers.length; i++){
        var children = assignedUsers[i]._doc.columns[0];
        for(var j=0;j<children.length;j++){
          var childId = children[j]._doc._id;
          for(var k=0; k<  assignedUsers.length; k++){
            var id = assignedUsers[k]._doc.employee._id;
            if(childId.toString() === id.toString()){
              console.log(true);
              children[j]._doc.columns[0] = assignedUsers[k]._doc.columns[0] ;
              assignedUsers.splice(k, 1);
            }
          }

        }
        
      }

      res.json({
          type: true,
          data: assignedUsers
      });
    }
    else{
      res.json({
          type: true,
          data: []
      });
    }
    
  });



    // OrgHierarchy.find ( { children: { $exists: true, $not: {$size: 0} }  }, 'empName designation empId branch address contact' )
    //   .populate ( 'empName designation branch address contact' )
    //   .exec ( function ( err, orgChart ) {
    //      if (err) {
    //         res.json({
    //             type: false,
    //             message: "Could not fetch the Organization Chart",
    //             data: "Error occured: " + err
    //         });
    //     } else {
    //         res.json({
    //             type: true,
    //             data: orgChart
    //         });
    //     }
    //   });
});




module.exports = router;
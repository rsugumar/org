/**************************************************************************
* Author: Sukumar Raghavan
* FileName: index.js
* Description: Index file
* History:
*  Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var async = require('async');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('underscore');

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


/* GET home page. */
router.get('/', function(req, res, next) {
  var managerList = [];
  var companyList = [];
  var branchList = {};

  res.locals.company = {};
  res.locals.branch = {};
  res.locals.manager = {};

  res.render('updateEmployee', { isEnabled: false,
                   branchList: branchList,
                   managerList: managerList,
                   companyList: companyList });
});

router.post ( '/', function ( req, res, next ) {
  console.log ( 'POST REQ Received:\n', req.body );

  var managerList = [];
  var companyList = [];
  var branchList = {};
  var company = {};
  var branch = {};

  var employeeList = server.orgCacheInstance.getEmployeeList( );
  var companyCacheList = server.orgCacheInstance.getCompanyList( );
  var branchCacheList = server.orgCacheInstance.getCompBranchList( );

  branchList = branchCacheList;

  _.each ( companyCacheList , function ( item ) {
    companyList.push( item.CompanyName );
  });

   var tasks = [];

   var empObjId = '';
   var name = '';
   var profilepixId = '';


  var empQuery = function ( callback ) {
    console.log ( 'EmpQuery...' );
    Employee.findOne({empId: req.body.employeeID},
                    '_id',
                    function ( err, result ) {
      if ( result == null  ) {
        console.log ( 'not found' );
        res.sendStatus ( 404 );
      } else if ( err ) {
        console.log ( err );
        res.sendStatus ( 404 );
      } else {
        empObjId = result._id;
        callback ( );
      }
    });
  }

   var fetchQuery = function ( callback ) {
      console.log ( 'fetchQuery..');
      Employee.findOne({_id: ObjectId(empObjId)},'department division designation skillSets empId address contact company profilePix branch empName' ).
          populate('empName company branch address contact profilePix').
        exec(function ( err, result ) {

      if( result ) {

        console.log(result);
        name = result.empName.fName + ' ' + result.empName.mName + ' ' + result.empName.lName;
        res.locals.fName = result.empName.fName;
        res.locals.mName = result.empName.mName;
        res.locals.lName = result.empName.lName;

        res.locals.employeeId = result.empId;
        res.locals.designation = result.designation;
        res.locals.department = result.department;
        res.locals.division = result.division;
        res.locals.skills = result.skillSets;
        res.locals.company = result.company.companyName;
        res.locals.branch = result.branch.branchName;
        res.locals.workNum = result.contact.workNo;
        res.locals.mobNum = result.contact.mobNo;
        res.locals.email = result.contact.emailId;

        res.locals.addrL1 = result.address.addressLine1;
        res.locals.addrL2 = result.address.addressLine2;
        res.locals.addrL3 = result.address.addressLine3;
        res.locals.city = result.address.city;
        res.locals.state = result.address.state;
        res.locals.country = result.address.country;
        res.locals.pinCode = result.address.pinCode;
        res.locals.profilepix = result._id + "/profilePix";

        callback ( );
      } else {
        throw err;
        res.sendStatus(404);
      }
  });
    }

  var responseboolean = true;
  var responseLocal = '';


  var managerListQuery = function ( callback ) {
      //OrgHierarchy.find({employee: ObjectId(empObjId)})


      OrgHierarchy.find({}, 'employee children ')
            .populate('employee')
            .exec(function(err, result) {
              var options = [
                    {
                       path: 'employee.empName',
                       select: 'employee fName mName lName',
                       model: 'EmployeeName'
                    },
                    {
                      path: 'employee.company',
                      selet: 'companyName',
                      model: 'Company'
                    } ];
                OrgHierarchy.populate( result, options, function() {
                  if (result) {
                  _.each(result, function( entry ) {
                    console.log('entry at manager List : ' + entry);
                    if (entry.employee) {
                      var managerJSON = {_id: entry.employee.empName.employee,
                                 fName: entry.employee.empName.fName,
                                 mName: entry.employee.empName.mName,
                                 lName: entry.employee.empName.lName,
                                 company: entry.employee.company.companyName
                              };
                      var tempname = entry.employee.empName.fName + ' ' + entry.employee.empName.mName + ' ' + entry.employee.empName.lName;
                      if( tempname != name){
                      managerList.push(managerJSON);
                      }
                      var mymanager = _.find(entry.children, function(oid) {
                        return (empObjId.equals(oid));
                      });
                      console.log ( '@herer' + mymanager);
                      if (mymanager != undefined) {
                        responseLocal = entry.employee.empName.fName + ' ' + entry.employee.empName.mName + ' ' + entry.employee.empName.lName;
                        responseboolean = false;
                      }
                    }
                  });
                }
                if(responseboolean == true){
                  console.log('came to true');
                  res.locals.manager = '--Select the Manager--';
                }
                else {
                  console.log('came to false');
                  res.locals.manager = responseLocal;
                }
                callback();
                });
            })
    }


    tasks.push ( empQuery );
    tasks.push ( fetchQuery );
    tasks.push ( managerListQuery );


   async.series ( tasks, function ( ) {
      console.log ( 'Finally reinitialize...' );
    server.orgCacheInstance.reInitialize ( );
    res.render('updateEmployee', {  isEnabled: true,
                    employeeObjid: empObjId,
                    branchList: branchList,
                    managerList: managerList,
                    companyList: companyList });
  });
});

//post for updating the record
router.post ( '/upddel', function ( req, res, next ) {
  console.log ( 'Received:\n', req.body );
  console.log ( 'POST REQ Files Received:\n', req.files );

  var tasks = [];
  var contactid = '';
  var addressid = '';
  var empNameid = '';
  var companyid = '';
  var branchid = '';
  var managerid = '';
  var oldmanagerid = '';
  var profilepixid = '';
  var fileUploadDetails = {data: '',
                            metadata: { fileType: '', fileSize: 0 } };

if( req.body.button == 'Update') {
    console.log ( 'update ');


var companyfindQuery = function ( callback ) {
  var stringtmp =  req.body.company ;
  stringtmp = stringtmp.replace('string:', '');
  Company.findOne({companyName: stringtmp}).
          exec ( function ( err, result ) {
            if ( result ){
              companyid = result._id;
              console.log ( 'got the comapny: ' + companyid);
              callback ( );
            }

            if ( err ){
              console.log ( err );
              res.sendStatus ( 404 );
            }
          });
}

var branchfindQuery = function ( callback ) {
  var stringtmp =  req.body.branch ;
  stringtmp = stringtmp.replace('string:', '');
  Branch.findOne({branchName: stringtmp}).
          exec ( function ( err, result ) {
            if ( result ){
              branchid = result._id;
              console.log ( 'got the branch: ' + branchid);
              callback ( );
            }

            if ( err ){
              console.log ( err );
              res.sendStatus ( 404 );
            }
          });
}

var managerfindQuery = function ( callback ) {
  if( req.body.manager == undefined){
    console.log ( 'undefined');
    callback ();

  } else {
    managerid = req.body.manager;
    console.log ( 'got the manager Id : ' + managerid);
    OrgHierarchy.findOne({employee: req.body.eid}).
        exec ( function ( err , result ) {
          if ( result )
          {
            oldmanagerid = result.parents;
            console.log ( 'got the old manager Id : ' + oldmanagerid);
            callback ();
          }

          if ( err )
          {
            console.log ( err );
            res.sendStatus ( 404 );
          }
        });
  }
}

var managerupdateQuery = function ( callback ){
  console.log ('inside the managerupdateQuery ');

  OrgHierarchy.findOne({employee: req.body.eid}).
          exec( function ( err, result ){
              if ( result ){
                OrgHierarchy.findOneAndUpdate(
                      { _id: result._id } ,
                      {
                        $set:   {
                            employee : result.employee,
                            parents : managerid, //updating the manager to the eid here
                            children : result.children,
                            __v : result.__v
                          }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ managersettingUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ managersettingUpdate:" +result);
                          callback ( );
                        }

                      });
              }

              if ( err ){
                console.log ( err );
                res.sendStatus ( 404 );
              }
          });
}

var parentchildrenupdateQuery = function ( callback ){
  console.log("inside parentchildrenupdateQuery");
  OrgHierarchy.findOne({employee: managerid}).
          exec( function ( err, result ){
              if ( result ){
                var tempchildren = result.children;
                tempchildren.push(req.body.eid);
                console.log('tempChildren : ' + tempchildren);

                OrgHierarchy.findOneAndUpdate(
                      { _id: result._id } ,
                      {
                        $set:   {
                            employee : result.employee,
                            parents : result.parents,
                            children : tempchildren,
                            __v : result.__v
                          }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ managerUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ managerUpdate:" +result);
                          callback ( );
                        }

                      });
              }

              if ( err ){
                console.log ( err );
                res.sendStatus ( 404 );
              }
          });
}

var topparentchildrenupdateQuery = function ( callback ){
  console.log("inside topparentchildrenupdateQuery");

  if( oldmanagerid == null ){
    callback();
    return;
  }
  OrgHierarchy.findOne({employee: oldmanagerid}).
          exec( function ( err, result ){
              if ( result ){
                var tempchildren = result.children;
                var index = tempchildren.indexOf(req.body.eid);

                if( index > -1 ){
                  tempchildren.splice(index, 1);
                }

                console.log('tempChildren@topManagerUpdate : ' + tempchildren);

                OrgHierarchy.findOneAndUpdate(
                      { _id: result._id } ,
                      {
                        $set:   {
                            employee : result.employee,
                            parents : result.parents,
                            children : tempchildren,
                            __v : result.__v
                          }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ topManagerUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ topManagerUpdate:" +result);
                          callback ( );
                        }

                      });
              }

              if ( err ){
                console.log ( err );
                res.sendStatus ( 404 );
              }
          });
}

var employeeupdatequery = function ( callback )  {
  Employee.findOne({_id: req.body.eid}).
            exec ( function ( err , result ){
              if ( result ) {
                // finding all the Obj Id's
                contactid = result.contact;
                addressid = result.address;
                empNameid = result.empName;
                profilepixid = result.profilePix;

                Employee.findOneAndUpdate(
                      { _id: req.body.eid } ,
                      {
                        $set:   {
                            profilePix : profilepixid, // to do : new profile pix id
                            address : addressid,
                            contact : contactid,
                            branch : branchid,
                            company : companyid,
                            empName : empNameid,
                            designation : req.body.designation,
                            department : req.body.department,
                            division : req.body.division,
                            empId : req.body.empId,
                            skillSets : req.body.skillSets,
                            __v : result.__v,
                            }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ companyUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ companyUpdate:" +result);
                          callback ( );
                        }

                      });
              }

              if ( err ){
                  console.log ( err );
                  res.sendStatus ( 404 );
              }

            });
}

var contactupdatequery = function ( callback ) {
  Contact.findOne({_id: contactid}).
          exec ( function ( err, result){
            if ( result ){
                Contact.findOneAndUpdate(
                      { _id: contactid } ,
                      {
                        $set:   {
                            emailId : req.body.emailId,
                            mobNo : req.body.mobNo,
                            workNo : req.body.workNo,
                            objectID : result.objectID,
                            isVisible : result.isVisible,
                            __v : result.__v
                            }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ contactUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ contactUpdate:" +result);
                          callback ( );
                        }

                      });
            }
            if( err ){
              console.log( err );
              res.sendStatus ( 404 );
            }
          });
}

var addressupdatequery = function ( callback ) {
  Address.findOne({_id: addressid}).
          exec ( function ( err, result){
            if ( result ){
                Address.findOneAndUpdate(
                      { _id: addressid } ,
                      {
                        $set:   {
                            country : req.body.country,
                            state : req.body.state,
                            city : req.body.city,
                            pinCode : req.body.pinCode,
                            addressLine3 : req.body.addressLine3,
                            addressLine2 : req.body.addressLine2,
                            addressLine1 : req.body.addressLine1,
                            objectID : result.objectID,
                            __v : result.__v
                            }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ addressUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ addressUpdate:" +result);
                          callback ( );
                        }

                      });
            }
            if( err ){
              console.log( err );
              res.sendStatus ( 404 );
            }
          });
}

var empnameupdatequery = function ( callback ) {
  EmpName.findOne({_id: empNameid}).
          exec ( function ( err, result){
            if ( result ){
                EmpName.findOneAndUpdate(
                      { _id: empNameid } ,
                      {
                        $set:   {
                            employee : result.employee,
                            lName : req.body.lName,
                            mName : req.body.mName,
                            fName : req.body.fName,
                            __v : result.__v
                            }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ EmpNameUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ EmpNameUpdate:" +result);
                          callback ( );
                        }

                      });
            }
            if( err ){
              console.log( err );
              res.sendStatus ( 404 );
            }
          });
  }

    var profilePicUpdateQuery = function ( callback ) {
      ProfilePix.findOne({_id: profilepixid}).
                exec ( function ( err , result ) {
                  if ( result ){
                    ProfilePix.findOneAndUpdate(
                      { _id: profilepixid } ,
                      {
                        $set:   {
                            employee : result.employee,
                            fileSize : fileUploadDetails.metadata.fileSize,
                            fileType : fileUploadDetails.metadata.fileType,
                            data : fileUploadDetails.data,
                            __v : result.__v
                            }
                      },
                      {new: true},
                      function ( err, result ) {
                        if ( err ){
                          console.log("err @ ProfilePixUpdate:" +err);
                          res.sendStatus ( 404 );
                        }

                        if ( result ){
                          console.log("success @ ProfilePixUpdate:" +result);
                          callback ( );
                        }

                      });

                  }
                  if ( err ) {
                    console.log( err );
                  res.sendStatus ( 404 );
                  }
                });
    }



  tasks.push ( companyfindQuery );
  tasks.push ( branchfindQuery );
  tasks.push ( managerfindQuery );
  tasks.push ( employeeupdatequery );
  tasks.push ( contactupdatequery );
  tasks.push ( addressupdatequery );
  tasks.push ( empnameupdatequery );

  if( req.body.croppedImage != undefined){
    var croppedImgHeader = "data:image/png;base64,";
    var base64Data = req.body.croppedImage.slice(croppedImgHeader.length);
    var dataBuffer = new Buffer(base64Data, 'base64');
    fileUploadDetails.data = dataBuffer;
    fileUploadDetails.metadata.fileType = "png";
    fileUploadDetails.metadata.fileSize = dataBuffer.length;
    tasks.push ( profilePicUpdateQuery );
  }


  if( req.body.manager != undefined ){
    tasks.push ( managerupdateQuery );
    tasks.push ( parentchildrenupdateQuery );
    tasks.push ( topparentchildrenupdateQuery );
  }

  async.series ( tasks, function ( ) {
    console.log ( 'Finally reinitialize...' );
    // To do : server.orgCacheInstance.reInitialize ( );
    //res.sendStatus ( 200 );
    res.writeHead( 200, {'Location': '/updateEmployee'});
    res.end();
  });

} else {
    //do delete
    console.log ( 'do delete');
    var tasks = [];
    var parent = '';
    var children = [];
    var newchildren = [];

    var chartStructureQuery = function ( callback ) {
      console.log ( ' entering the chartStructureQuery ');
      OrgHierarchy.findOne({employee: ObjectId(req.body.eid)}).
                exec ( function ( err , result ){
                  if ( result ){
                    parent = result.parents;
                    children = result.children;
                    callback( );
                  }
                  if ( err ){
                    console.log ( err );
                    res.sendStatus ( 404 );
                  }
                });
    }


    var removechildmappinginparent = function ( callback ) {
      console.log ( ' entering the removechildmappinginparent ');
      if( parent == null ){
        callback ();
        return;
      }
      OrgHierarchy.findOne({employee: parent}).
                exec ( function ( err , result ){
                  if ( result ){
                    _.each(result.children , function ( item ) {
                      if ( item != req.body.eid ){
                        newchildren.push( item );
                      }
                    });

                    OrgHierarchy.findOneAndUpdate( {employee: parent},
                            {
                              $set: {
                                employee : result.employee,
                                parents : result.parents,
                                children : newchildren,
                                __v : result.__v
                              }
                            },
                            {new : true},
                            function ( err, result ) {
                      if ( err ){
                        console.log("err @ newchildren-update:" +err);
                        res.sendStatus ( 404 );
                      }

                      if ( result ){
                        console.log("success @ newchildren-update:" +result);
                        callback () ;
                      }
                    });
                  }
                  if ( err ){
                    console.log ( err );
                    res.sendStatus ( 404 );
                  }
                });
    }

    var setchildrenQuery = function ( callback ) {
      console.log ( ' entering the setchildrenQuery ');
      if ( parent == null || 0 == children.length ){
        console.log ( 'parent null block ');
        callback( );
        return;
      }

      var i = 1;

      console.log ( 'children : ' , children );
      _.each ( children , function ( item ) {
        OrgHierarchy.findOne({employee: ObjectId(item)}).
            exec ( function ( err , result ){
                if ( result ){
                  OrgHierarchy.findOneAndUpdate( {employee: item},
                            {
                              $set: {
                                employee : result.employee,
                                parents : parent,
                                children : result.children,
                                __v : result.__v
                              }
                            },
                            {new : true},
                            function ( err, result ) {
                      if ( err ){
                        console.log("err @ OrgDelete-Update:" +err);
                        res.sendStatus ( 404 );
                      }

                      if ( result ){
                        console.log("success @ OrgDelete-Update:" +result);
                        if ( i == children.length ){
                          callback ( );
                        } else {
                          i++ ;
                        }
                      }

                    });
                }
                if ( err ){
                  console.log ( err );
                  res.sendStatus ( 404 );
                }
            });

          })
      }

    var deleteEmployeeQuery = function ( callback ) {
      console.log ( ' entering the deleteEmployeeQuery ');
      if( parent == null ){
        callback () ;
        return;
      }

      Employee.find({_id: req.body.eid}).remove().
        exec ( function ( err, result ) {
            if( result ){
              console.log ( "this is the result which got deleted :" + result);
              callback () ;
            }
            if( err ) {
              console.log( err );
              res.sendStatus ( 404 );
            }

        });
      }

    var updateparentchildren = function ( callback ){
      console.log ( 'entering the updateparentchildren ');
      if(parent == null || 0 == children.length ){
        callback();
        return;
      }

      OrgHierarchy.findOne({employee: parent}).
            exec ( function ( err , result ){
                if ( result ){
                  var tempChildrenList = result.children;
                  _.each ( children, function ( item ){
                    tempChildrenList.push( item );
                  })
                  OrgHierarchy.findOneAndUpdate( {employee: parent},
                            {
                              $set: {
                                employee : result.employee,
                                parents : result.parents,
                                children : tempChildrenList,
                                __v : result.__v
                              }
                            },
                            {new : true},
                            function ( err, result ) {
                      if ( err ){
                        console.log("err @ children-Update:" +err);
                        res.sendStatus ( 404 );
                      }

                      if ( result ){
                        console.log("success @ children-Update:" +result);
                        callback();
                      }

                    });
                }
                if ( err ){
                  console.log ( err );
                  res.sendStatus ( 404 );
                }
            });
    }


    var removemiddlemaninOrgChart = function ( callback ) {
      console.log ( ' entering the removemiddlemaninOrgChart ');
      OrgHierarchy.findOne({employee: ObjectId(req.body.eid)}).remove().
                exec ( function ( err , result ){
                  if ( result ){
                    console.log('removed the middleman from the OrgHierarchyChart ');
                    callback( );
                  }
                  if ( err ){
                    console.log ( err );
                    res.sendStatus ( 404 );
                  }
                });
    }

    tasks.push ( chartStructureQuery );
    tasks.push ( removechildmappinginparent );
    tasks.push ( setchildrenQuery );
    tasks.push ( deleteEmployeeQuery );
    tasks.push ( removemiddlemaninOrgChart );
    tasks.push ( updateparentchildren );


    async.series( tasks , function ( ) {
      if ( parent == null ){
        console.log ( 'Boss cannot be deleted! ');
        res.sendStatus ( 403 );
      } else {
        console.log ('Delete successful ');
        //res.sendStatus ( 200 );
        res.writeHead( 200, {'Location': '/updateEmployee'});
      }
    });
}

});

module.exports = router;

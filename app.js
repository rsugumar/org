/**************************************************************************
* Author: Sukumar Raghavan
* FileName: app.js
* Description: Main file
* History:
* Initial Release   06-June-2015
**************************************************************************/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var jwt = require('jsonwebtoken');
var multer = require('multer');
var async = require('async');

var config = require('./config');
var db = mongoose.connect(config.database);

var routes = require('./routes/index');
var chart = require('./routes/chart');
var user = require('./routes/user');
var updateCom = require('./routes/updateCompany');
var updateEmp = require('./routes/updateEmployee');
var users = require('./routes/users');
var company = require('./routes/company');
var branches = require('./routes/branches');
var getcompany = require('./routes/getcompany');
var getuser = require('./routes/getuser');
var getGroupInfo = require('./routes/getGroupInfo');
var bulkRegister = require('./routes/bulkRegister');
var orgChart = require('./routes/orgChart');
//var setupGroupInfo = require('./routes/setupGroupInfo');
//var setupadmin = require('./routes/setupAdmin');
var auth = require('./routes/auth');
var logout = require('./routes/logout');
var userAuth = require('./models/UserAuth');
var checkAppUpdate = require('./routes/checkAppUpdate')


var app = express();

process.env.NODE_ENV = 'production';
//process.env.NODE_ENV = 'development';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('superSecret', config.secret);

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(multer({ dest: './uploads/' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

// Unauthenticated routes
app.use('/auth', auth);
app.use('/logout', logout);
app.use('/api/user', getuser);
//app.use('/setupadmin', setupadmin);

//All the below routes needed to be authenticated before rendering
// router.use(function(req, res, next) {
//   // check header or url parameters or post parameters for token
//   var token = req.body.token ||
//               req.query.token ||
//               req.cookies['access_token'] ||
//               req.headers['x-access-token'];

//   var emailid = req.headers['emailid'];

//   // decode token
//   if (token) {
//     // verifies secret and checks exp
//     jwt.verify(token, app.get('superSecret'), function(err, decoded) {
//       if (err) {
//         return res.json({ success: false, message: 'Failed to authenticate token.' });
//       } else {
//         var successCB = function(req, res) {
//           // if everything is good, save to request for use in other routes
//           req.decoded = decoded;
//           next();
//         }

//         var failureCB = function(req, res) {
//           res.status(403)
//              .send({status: 403, data: null, message: 'Authentication failed!'});
//         }

//         userAuth.findOne({emailid: emailid})
//                 .exec( function(err, user) {
//           if (err) throw err;

//           if (!user) {
//             failureCB(req, res);
//           } else {
//             successCB(req, res);
//           }
//         });
//       }
//     });
//   } else {
//     console.log("NO Token Present");
//     // if there is no token
//     // return an error
//     res.status(403)
//        .send({status: 403, data: null, message: 'Authentication failed!'});
//     //res.redirect('/auth');
//   }
// });

app.use('/', router);

// Authenticated routes
app.use('/', routes);
app.use('/user', user);
app.use('/updateCompany', updateCom);
app.use('/updateEmployee', updateEmp);
app.use('/company', company);
app.use('/bulkRegister', bulkRegister);
app.use('/orgChart', orgChart)

//app.use('/logout', logout);
//app.use('/setupadmin', setupadmin);

// apply the routes to our application with the prefix /api
app.use('/api/chart', chart);
//app.use('/api/user', getuser);
app.use('/api/users', users);
app.use('/api/company', getcompany);
app.use('/api/branches', branches);
app.use('/api/getGroupInfo', getGroupInfo);
app.use('/api/checkForAppUpdate', checkAppUpdate);
//app.use('/api/setupGroupInfo', setupGroupInfo);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.NODE_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.NODE_IP || '127.0.0.1';

app.listen (server_port, server_ip_address, function() {
   console.log('%s: Node server started on %s:%d ...',
       Date(Date.now() ), server_ip_address, server_port);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

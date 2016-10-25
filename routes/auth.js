/**************************************************************************
* Author: Abhi/Sukumar
* FileName: auth.js
* Description: App authentication request will be done here.
* History:
*  Initial Release   04-Oct-2015
**************************************************************************/
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var config = require('../config');
var userAuth = require('../models/UserAuth');
var Contact = require('../models/ContactModel');

router.get('/', function(req, res) {
  res.clearCookie('access_token');
  res.render('auth');
});

router.post('/', function(req, res) {
  console.log('Received: ', req.body);
  userAuth.findOne({emailid: req.body.emailid})
          .exec( function(err, user) {
    if (err) throw err;

    var isApp = true;
    if (req.body.isApp === 'false') {
      isApp = false;
    }

    if (!user) {
      console.log(req.body.emailid + " not found in UserAuth");
      if (!isApp) {
        res.clearCookie('access_token');
        res.status(403)
            .send({status: 403,
                    data: null,
                    message: 'Authentication failed! No such user found!'});
      } else {
        if (req.body.signup === 'true') {
          Contact.findOne({emailId: req.body.emailid})
                 .exec ( function ( err, result ) {
            if (err) throw err;
            if( result == null ){
              console.log("result is null @ contact for" + req.body.emailid);
              res.status(404)
                  .send({status: 404,
                          data: null,
                          message: 'User not found!'});
              return;
            } else {
              console.log("Processing to create auth for " + req.body.emailid);
              var appUser = new userAuth({
                              emailid: req.body.emailid,
                              password: req.body.password,
                              isAdmin: false
                            });

              appUser.save(function(err) {
                if (err) {
                  throw err;
                }

                console.log('User Saved Successfully!');
                res.send( {success: true} );
              });
            }
          });
        } else {
          res.status(403)
              .send({status: 403,
                      data: null,
                      message: 'Authentication failed!'});
        }
      }
    } else {
      if (user.password != req.body.password) {
        if (!isApp) {
          res.clearCookie('access_token');
        }

        res.status(403)
            .send({status: 403,
                   data: null,
                  message: 'Authentication failed!'});
      } else {
        var token = jwt.sign({
          emailid: req.body.emailid
        },
        config.secret,
        {
          expiresIn: '365d' // expires in 1 year
        });

        //res.cookie('access_token', token, { maxAge: 60*60*24 }).send('Authentication success!!');
        if (!isApp) {
          var hour = 3600000;
          res.cookie('access_token',
                      token,
                      { maxAge: 1.25 * hour })
             .redirect('/');
          } else {
            res.status(200)
                .send({
                  status: 200,
                  data: {emailid: req.body.emailid, token: token},
                  message: 'Authentication Successful!'
                });
          }
        //console.log(res);
        //res.clearCookie('access_token');
        //res.status(200).send(token);
        //Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsI.eyJpc3MiOiJodHRwczotcGxlL.mFrs3Zo8eaSNcxiNfvRh9dqKP4F1cB; Secure; HttpOnly;
        //res.writeHead(200, {'Set-Cookie': 'access_token=' + token + '; Secure; HttpOnly;',
        //                    'Content-Type': 'text/plain'} );
        // return the information including token as JSON
        //res.end('Success');

        // res.status(200)
        //     .send({
        //       status: 200,
        //       data: {token: token},
        //       message: 'Enjoy your token!'
        //     });
      }
    }
  });
});


module.exports = router;

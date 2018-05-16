var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verifyToken = require('./verifyToken');
var dbConnection = require('./dbServer');
var bcrypt = require('bcrypt-nodejs');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }
/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get config file

router.post('/login', function(req, res) {
        localStorage.clear();
    dbConnection.query('SELECT * FROM Users where username=?',[req.body.username], function(err, result) {
        if(!result[0]){
            //res.status(401).send({ auth: false, token: null });
            localStorage.setItem('auth', false);
            localStorage.setItem('token', '');
             return res.redirect('/me');
        }
      // check if the password is valid 
        var passwordIsValid = (bcrypt.compareSync(req.body.password, result[0].password) && req.body.username == result[0].username);
    if (!passwordIsValid){
        //res.status(401).send({ auth: false, token: null });
        localStorage.setItem('auth', false);
        localStorage.setItem('token', '');
        return res.redirect('/me');
    } 

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: result[0].id, username: result[0].username }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    // return the information including token as JSON
    //res.status(200).send({ auth: true, token: token });
    localStorage.setItem('auth', true);
    localStorage.setItem('token', token);
    localStorage.setItem('id', result[0].id);
    localStorage.setItem('username', result[0].username);
    
    res.redirect('/me');
    });
    
    
});


router.get('/me', verifyToken, function(req, res, next) {
    res.send(localStorage.getItem('username'));
});

router.post('/me', verifyToken, function(req, res, next) {
    var user=[req.body.username, bcrypt.hashSync(req.body.password)];
    dbConnection.query('INSERT INTO Users (username, password) VALUES (?)', [user], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
      res.send("ciao")
});
module.exports = router;
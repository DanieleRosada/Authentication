var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verifyToken = require('./verifyToken');
var dbConnection = require('./dbServer');
var bcrypt = require('bcrypt-nodejs');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get config file

router.post('/', function(req, res) {
    dbConnection.query('SELECT * FROM Users where username=?',[req.body.username], function(err, result) {
        if(!result[0]){
            return res.status(401).send({ token: null, message: 'User not find.' });
        }
      // check if the password is valid 
        var passwordIsValid = (bcrypt.compareSync(req.body.password, result[0].password) && req.body.username == result[0].username);
    if (!passwordIsValid){
        return res.status(401).send({ token: null, message: 'Incorrect password.' });
    } 

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: result[0].id, username: result[0].username }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    // return the information including token as JSON
    res.status(200).send({ token: token, id: result[0].id, username: result[0].username });
    });
    
    
});


router.get('/home', verifyToken, function(req, res, next) {
    res.send(req.username);
});

router.post('/home', verifyToken, function(req, res, next) {
    dbConnection.query('SELECT * FROM Users where username=?',[req.body.username], function(err, result) {
        if(!result[0]) res.send("User alredy exist.");
        var user=[req.body.username, bcrypt.hashSync(req.body.password)];
        dbConnection.query('INSERT INTO Users (username, password) VALUES (?)', [user], function (err, result) {
        res.send("Registered user.");
      }); 
    });   
});

router.put('/home', verifyToken, function(req, res, next){
    dbConnection.query('UPDATE Users SET username =?, password =? where username=?',[req.body.newUsername, bcrypt.hashSync(req.body.newPassword), req.body.username], function(err, result) {
        if(!result[0]) res.send("Not changed, non-existent.");
        res.send("Username and password are change, or one of the two.");
    });
});

router.delete('/home', verifyToken, function(req,res,next){
    dbConnection.query('DELETE FROM Users where username=?',[req.body.username], function(err, result) {
        if(!result[0]) res.send("User not deleted, non-existent.");
        res.send("User deleted.");
    });
});
module.exports = router;
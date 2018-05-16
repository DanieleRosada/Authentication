var express = require('express');
var app = express();
global.__root = __dirname + '/';

app.get('/api', function (req, res) {
    res.status(200).send('API works.');
});

var authController = require(__root + 'auth/authController');
app.use('/api/auth', authController);

var server = app.listen(5000, function () {
    console.log('Application server listening on port 5000');
});
var mysql =require('mysql');
var connection = mysql.createConnection({
    host: 'x',
    user: 'x',
    password: 'x',
    database: 'x'
});

connection.connect(function(err){
    if (err) throw err;
});

module.exports = connection;
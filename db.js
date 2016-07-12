/**
 * Created by jamiecho on 7/8/16.
 */
var mysql = require('mysql');

var con = mysql.createConnection({
    host     : 'hitag-test-database.clahdngv3ody.us-east-1.rds.amazonaws.com',
    user     : 'masteruser',
    password : 'masterpw',
    database : 'testdb'
});

con.connect(function(err){
    if(err){
        console.log('Error connecting to DB');
        return;
    }
    console.log('Connection established');
});


/*con.end(function(err) {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
});*/

exports.con = con;
//exports.end = end;
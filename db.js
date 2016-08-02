/**
 * Created by jamiecho on 7/8/16.
 */
var mysql = require('mysql');

var con = mysql.createConnection({
    host     : process.env.HOST,
    user     : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
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

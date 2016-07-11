/**
 * Created by jamiecho on 7/8/16.
 */
var mysql = require('mysql');

var con = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'CheBellaC0sa',
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

function query(qstr, callback){
    con.query(qstr, callback);
}

exports.query = query;
//exports.end = end;
/**
 * Created by jamiecho on 7/8/16.
 */

var express = require('express');
var formidable = require('formidable');
var bodyparser = require('body-parser');
var path = require('path');

var db = require('./db');

var app = express();

//boilerplate initialization
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'public'))); //statically served files
//this will be the location of the files
app.set('view engine', 'jade');

app.get('/', function(req,res){
    db.query('SELECT * FROM entries',function(err,rows){
        if(err)
            throw err;
        res.end(JSON.stringify(rows));
    })
});

app.post('/', function(req,res){
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/tmp';
    form.keepExtensions = true;

    form.parse(req, function (err, fields, files) {
        if (!err) {
            console.log('Fields: ', fields);
            console.log('Files Uploaded: ' + files.photo);

            res.end("THANKS FOR POSTING");

            db.write(fields.personInfo, fields.tagInfo, files.photo, function () {
                res.render('upload');
            });
        } else {
            //set header, error handling, etc.
            res.end('ERROR');
        }
    });
});

var port = process.env.PORT || 8000;
app.listen(port);

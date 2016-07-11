/**
 * Created by jamiecho on 7/8/16.
 */

var express = require('express');
var formidable = require('formidable');
var bodyparser = require('body-parser');
var path = require('path');
var fs = require('fs');
var aws = require('aws-sdk');
var s3 = new aws.S3();

// var db = require('./db');

var app = express();
var tmp_dir = path.join(__dirname, 'tmp');

//boilerplate initialization
app.use(bodyparser.json());
app.use(express.static(tmp_dir)); //statically served files
//this will be the location of the files
app.set('view engine', 'jade');

app.get('/', function(req,res){
    //res.end('https://s3-us-west-2.amazonaws.com/uniquely-named-bucket/random_stuff.txt');

    var params = {Bucket: 'uniquely-named-bucket', Key: 'random_stuff.txt'};
    //var file = fs.createWriteStream('/path/to/file.jpg');
    s3.getObject(params).createReadStream().pipe(res);

    /*
    // TESTING MYSQL
    db.query('SELECT * FROM entries',function(err,rows){
        if(err)
            throw err;
        res.end(JSON.stringify(rows));
    })*/
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

            /*
            // TESTING MYSQL
            db.write(fields.personInfo, fields.tagInfo, files.photo, function () {
                res.render('upload');
            });
            */
        } else {
            //set header, error handling, etc.
            res.end('ERROR');
        }
    });
});

var port = process.env.PORT || 8000;
app.listen(port);

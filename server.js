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
var async = require('async');

var db = require('./db');

var app = express();
var tmp_dir = path.join(__dirname, 'tmp');

//boilerplate initialization
app.use(bodyparser.json());
app.use(express.static(tmp_dir)); //statically served files
//this will be the location of the files
app.set('view engine', 'jade');

function index(req, res) {

    // REAL CODE
    db.con.query('SELECT * FROM entries', function (err, rows) {
        if (err) {
            res.end("ERROR RETRIEVING ENTRIES FROM DATABASE");
        } else {
            //retrieved entries successfully
            async.each(rows,
                function (row, done) {
                    var key = row.file;
                    var params = {Bucket: 'uniquely-named-bucket', Key: key};
                    var filepath = path.join(tmp_dir, key);
                    var ofs = fs.createWriteStream(filepath);
                    s3.getObject(params).createReadStream().pipe(ofs).on('finish', function(err){
                        if(err){
                            console.log("ERROR CREATING OBJECT", key, "FROM FILESYSTEM");
                        }
                        done();
                    });
                },
                function (err, cb) {
                    if (err) {
                        res.end("ERROR GETTING OBJECTS FROM FILESYSTEM");
                    } else {
                        var files = rows.map(function (e, i) {
                            return {'path': e.file, 'description': e.description};
                        });
                        //
                        res.render('index', {'files': files});
                    }
                });

        }
    });

    // TEST CODE

    //// GET FILE FROM AWS S3 ...
    //var params = {Bucket: 'uniquely-named-bucket', Key: 'random_stuff.txt'};
    //var filepath = path.join(tmp_dir, 'random_stuff.txt');
    //var ofs = fs.createWriteStream(filepath);
    //var stream = s3.getObject(params).createReadStream().pipe(ofs); // create file in ephemeral directory
    //stream.on('finish', function (err) {
    //    //QUERY DB FROM AWS RDS-MySQL for record...
    //    db.query('SELECT * FROM entries', function (err, rows) {
    //        if (err) {
    //            res.end("ERROR RETRIEVING DATA FROM DATABASE");
    //        } else {
    //            res.render('index', {'files': [{'path': 'random_stuff.txt', 'description': JSON.stringify(rows)}]});
    //        }
    //    });
    //});
    /*

     // EVEN OLDER TEST CODE
     db.query('SELECT * FROM entries',function(err,rows){
     if(err)
     throw err;
     res.end(JSON.stringify(rows));
     })*/
}

app.get('/', index);

function listAllKeys(marker, keys, cb) {
    s3.listObjects({Bucket: 'uniquely-named-bucket', Marker: marker}, function (err, data) {
        if (err) {
            cb(err);
        } else {
            for (idx in data.Contents) {
                keys.push(data.Contents[idx].Key);
            }

            if (data.IsTruncated)
                listAllKeys(data.NextMarker, keys, cb);
            else
                cb();//end of objets
        }

    });
}

app.post('/', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/tmp';
    form.keepExtensions = true;

    form.parse(req, function (err, fields, files) {
        if (!err) {

            console.log(fields);


            var file = files.file;

            console.log(file);

            var ifs = fs.createReadStream(file.path);

            var params = {
                Bucket: 'uniquely-named-bucket',
                Key: file.name,
                Body: ifs
            };
            var options = {partSize: 10*1024*1024, queueSize: 1};

            var entry = {
                'file': file.name,
                'description': fields.description
            };

            console.log(entry);
            console.log("BEGINNING QUERY ... ");

            db.con.query('INSERT INTO entries SET ?', entry, function (err, result) {
                console.log('INSERTED ...');
                if(err){
                    res.end("ERROR UPLOADING ENTRY TO DATABASE");
                }else{

                    s3.upload(params, options, function(err, data) {
                        console.log("PUT OBJECT ...");
                        if (err) {
                            res.end("ERROR UPLOADING FILE TO FILESYSTEM");
                        } else {
                            console.log("successfully put object!!");
                            //file is up in the filesystem, all is good
                            index(req,res);
                        }
                    });
                }
            });

            /*
             // TESTING MYSQL
             db.write(fields.personInfo, fields.tagInfo, files.photo, function () {
             res.render('upload');
             });
             */
        } else {
            //set header, error handling, etc.
            res.end('ERROR PARSING FORM');
        }
    });
});

var port = process.env.PORT || 8000;
app.listen(port);

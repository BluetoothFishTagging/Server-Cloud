/**
 * Created by jamiecho on 7/8/16.
 */


var express = require('express');
var formidable = require('formidable');
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var fs = require('fs');
var aws = require('aws-sdk');
var session = require('express-session');
var bucket = 'hitag-fs';
var s3 = new aws.S3({Bucket: bucket});

var async = require('async');

var db = require('./db');

var app = express();

/* TMP_DIR */
var tmp_dir = path.join(__dirname, 'tmp');
var public_dir = path.join(__dirname, 'public');
if (!fs.existsSync(tmp_dir))
    fs.mkdirSync(tmp_dir);

//boilerplate initialization
app.use(bodyparser.json());
app.use(cookieParser());
app.use(express.static(tmp_dir)); //statically served files
app.use(express.static(public_dir));
//this will be the location of the files

app.use(session({
    secret: 'TunaDr3ams',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'jade');

function checkLogin(req, res, next) {
    if (!req.session.userid) {
        res.redirect('/login?dest=' + req.url);
    } else {
        next();
    }
}

function handleWebview(err,entries,res){
    if (err) {
        res.end("ERROR RETRIEVING ENTRIES FROM DATABASE");
    } else {
        async.each(entries,
            function (entry, done) {
                var key = entry.photo;
                var params = {
                    Bucket: bucket,
                    Key: key
                };
                var filepath = path.join(tmp_dir, key);
                if (fs.existsSync(filepath)) {
                    console.log("already exists");
                    // no need to create in the filesystem again.
                    done();
                } else {
                    var ofs = fs.createWriteStream(filepath);
                    s3.getObject(params).createReadStream().pipe(ofs).on('finish', function (err) {
                        if (err) {
                            console.log("ERROR CREATING OBJECT", key, "FROM FILESYSTEM");
                        }
                        done();
                    });
                }
            },
            function (err, cb) {
                if (err) {
                    res.end("ERROR GETTING OBJECTS FROM FILESYSTEM");
                } else {
                    res.render('index', {'entries': entries});
                }
            });

    }
}

app.get('/', checkLogin, function (req, res) {
    // REAL CODE

    if(req.session.userid == -1){ //admin
        db.con.query('SELECT * FROM webview', function(err,entries){
            handleWebview(err,entries,res);
        })
    }else{
        db.con.query('SELECT * FROM webview WHERE p_id = ?', req.session.userid, function (err, entries) {
            handleWebview(err,entries,res);
        });
    }

});

function createEntry(entry, req, res){

    var ifs = fs.createReadStream(path.join(tmp_dir, entry.photo));

    var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
    var params = {
        Bucket: bucket,
        Key: entry.photo,
        Body: ifs
    };

    db.con.query('INSERT INTO entries SET ?', entry, function (err, result) {
        console.log('INSERTED ...');
        if (err) {
            res.end("ERROR UPLOADING ENTRY TO DATABASE");
        } else {

            s3.upload(params, options, function (err, data) {
                console.log("PUT OBJECT ...");
                if (err) {
                    console.log(err);
                    res.end("ERROR UPLOADING FILE TO FILESYSTEM");
                } else {
                    console.log("successfully put object!!");
                    //file is up in the filesystem, all is good
                    res.redirect('/');
                }
            });
        }
    });
}
app.get('/upload', checkLogin, function(req,res){
    res.render('upload');
});

app.post('/upload', function (req, res) {
    //repurpose for schema
    var form = new formidable.IncomingForm();
    form.uploadDir = tmp_dir;
    form.keepExtensions = true;

    form.on('file', function(field, file) {
        //rename the incoming file to the file's name
        fs.rename(file.path, path.join(tmp_dir, file.name));
    });

    form.parse(req, function (err, fields, files) {

        var entry = {
            photo : files.photo.name,
            location : fields.location,
            time : fields.time,
            comments : fields.comments
        };

        if (!err) {
            db.con.query("SELECT * from persons where username = ? and passcode = AES_ENCRYPT(?,'TunaDr3ams')", [fields.username, fields.passcode], function(err,result){
                //check if user exists ...
                if(!err && result != undefined && result.length > 0){
                    entry.p_id = result[0].id;

                   //search existing tag
                   db.con.query('SELECT id from tags where nationalID = ?', fields.nationalID, function(err,result){
                       if(!err && result != undefined && result.length > 0){
                           //tag exists
                           entry.t_id = result[0].id;
                           //create entry
                           createEntry(entry, req,res);
                       }else{
                           var tag = {
                               countryID : fields.countryID,
                               nationalID : fields.nationalID,
                               comments : fields.comments
                           };
                           //tag does not exist, first create tag...
                           db.con.query('INSERT INTO tags SET ?',tag,function(err,result){
                               entry.t_id = result.insertId;
                               //then create entry
                               createEntry(entry,req,res);
                           });
                       }
                   });
               }else{
                   res.end('AUTHORIZATION FAILED');
               }

            });
        } else {
            //set header, error handling, etc.
            res.end('ERROR PARSING FORM');
        }
    });
});

function quotewith(s, q){
    return q + s + q;
}

function quote(s,q){
    if(!q){
        q = "'"; // default single quote
    }
    return q + s + q;
}

function buildQuery(o){
    var s = "";
    for(k in o) {
        s += quote(k, '`') + ' = ' + quote(o[k], "'") + ",";
    }
    return s.substring(0, s.length - 1); // get rid of last comma
}
function createUser(user, cb) {
    delete user.passcode_confirm;
    delete user.signup;
    db.con.query('SELECT * from persons WHERE username = ?', user.username, function(err,res){
        if(res != undefined && res.length > 0){
            cb(err,-1);
            //username already exists
            // possibly take them to "modification" page?
        }else{

			var pk = "AES_ENCRYPT('"+ user.passcode + "','TunaDr3ams')";
            delete user.passcode;

            var qstring = "INSERT INTO persons SET ";
            qstring += buildQuery(user);
            qstring += ", `passcode` = " + pk;

            console.log(qstring);

            db.con.query(qstring, function(err,res){
                console.log(err);
                console.log(res.insertId);
                cb(err, res.insertId);
            });
        }
    });

}

function findUser(username, passcode, cb) {
    db.con.query('SELECT EXISTS(SELECT * from persons WHERE username = ?) as `exists`', username, function(err,res){
        console.log(res);

        var unok = false,
            pcok = false,
            id = null;

        if(res != undefined && res.length > 0 && res[0].exists){
            unok = true; //username exists
            console.log("????");
            db.con.query("SELECT id from persons WHERE username = ? AND passcode = AES_ENCRYPT(?,'TunaDr3ams')", [username, passcode], function(err,res){
                console.log(err,res);
                if(!err && res != undefined && res.length > 0){
                    pcok = true;
                    id = res[0].id;
                }
                console.log(unok, pcok, id);
                cb(unok, pcok, id);
            });

        }
    });
}

app.get('/login',function(req,res){
    res.render('login');
});

app.post('/login', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(fields);
        findUser(fields.username, fields.passcode, function (unok, pcok, id) {
            console.log(unok, pcok, id);
            if(unok){
                if(pcok){
                    req.session.userid = id;
                    if(req.query.dest){
                        res.redirect(req.query.dest);
                    }else{
                        res.redirect('/');
                    }
                }else{
                    res.render('login',{wrong:true}); //todo: special handling about 'wrong'
                }
            }else{
                res.redirect('/signup');
            }
        });
    });

});

app.get('/signup',function(req,res){
    res.render('signup');
});

app.post('/signup',function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        createUser(fields,function(err,id){
            if(err){
                res.end("ERROR : SIGNUP FAILED");
            }else{
                if(id == -1){
                    res.end("ERROR : USERNAME ALREADY EXISTS");
                }else{
                    req.session.userid = id;
                    res.redirect('/');
                }
            }
        });
    });
    //TO IMPLEMENT -- send credentials to database

});

var port = process.env.PORT || 8000;
app.listen(port);

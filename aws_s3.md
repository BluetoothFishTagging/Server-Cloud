---
title: AWS S3
layout: template
filename: aws_s3
---

# AWS S3 
[AWS S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html) provides a *Simple Storage Service* that allows for easy interface to access any amount of data hosted on a cloud server. This helps with our app, hosted on heroku, to easily manage files.

## Tutorial

[Here](https://aws.amazon.com/training/intro_series/) you can both watch instructional video and follow very detailed a self-paced lab.

See the documentation below for snippets of tips.

## Setting up AWS S3 with Heroku / Node.js

1. Get the node driver for AWS:

   ```bash
   npm install --save aws-sdk
   ```

2. [Create your credentials](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html)

3. To load your credentials locally, in your .env file, add:

   ```bash
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
   S3_BUCKET_NAME=YOUR_BUCKET_NAME
   ```

   To configure heroku, you can either do:

   ```bash
   heroku config:set AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY AWS_SECRET_ACCESS_KEY=YOUR_...
   ```

   Or, provided that your .env file is completely configured:

   ```bash
   heroku config:set $(cat .env)
   ```

## Accessing the filesystem via Node.js

 - Setup

   ```javascript
   var bucket = 'my-bucket-name';
   var aws = require('aws-sdk');
   var s3 = new aws.S3({Bucket : bucket});
   var fs = require('fs');
   ```

 - Read File (from S3 into filesystem) 

   ```javascript
   var file = 'my-file-name';
   var params={
      Bucket : bucket,
      Key : file
   }
   var ofs = fs.createWriteStream(file);
   var ifs = s3.getObject(params).createReadStream().pipe(ofs).on('finish',function(err){
      if(err){
         console.log("ERROR");
      }else{
         console.log("SUCCESS");
      }
   });
   // now do stuff with the stream object
   ``` 

 - Write File

   ```javascript
   var file = 'my-file-name';
   var ifs = fs.createReadStream(file);
   var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
   var params = {
      Bucket : bucket,
      Key : file,
      Body : ifs
   };
   s3.upload(params,options, function(err,data){
      if(err){
         console.log("ERROR");
      }else{
         console.log("SUCCESS");
      }
   });
   ```

---
title: AWS RDS
layout: template
filename: aws_rds
---

# AWS RDS

[AWS RDS](https://aws.amazon.com/rds/) stands for Amazon Web Service Relational Database Service, running a DB instance in the cloud. Unlike its name, it also supports sequential databases such as MySQL.

## Tutorial

Before beginning this, see the [MySQL Tutorial](../mysql).

[Here](https://aws.amazon.com/training/intro_series/) you can both watch instructional video and follow very detailed a self-paced lab.

See the documentation below for snippets of tips.

## Setting up AWS RDS

1. Log into AWS Management Console and Navigate to Services > RDS.

2. Click **Launch a DB Instance**.

3. Select MySQL, and click **select**.

4. You should be in *Production?*. Select the radio button next to **MySQL** under **Dev/Test**.

5. You should be in *Specify DB Details.* Select **only show options that are eligible for RDS Free Tier**.

6. For your DB Instance Class, select **db.t2.micro**.

7. Fill all the fields under **Settings**.

8. You should be in *Configure Advanced Settings*. For your VPC Security Group, **default**.

   I don't recall if I had a default group. If the option isn't available, simply create a new security group.

9. Click **Launch a new DB Instance**.

9. Go to EC2 > Security Groups.

9. Select the security group you have specified and choose Actions > Edit Inbound Rules.

9. Set **Source** to **Anywhere** and click **Save**.

9. Wait until the DB Instance status is **available** in your RDS Dashboard > Instances.

9. Click on your instance to find your db endpoint (formatted as url:port); 

## Connecting to AWS RDS

 - Shell:

   ```bash
   export AWS_HOST=YOUR_DB_ENDPOINT
   export AWS_USER=YOUR_DB_USER
   export AWS_PASSWORD=YOUR_PASSWORD
   export AWS_DATABASE=YOUR_DATABASE
   mysql -h ${AWS_HOST} -u{AWS_USER} -p{AWS_PASSWORD} {AWS_DATABASE}
   ```

 - Node.js:

   1. In your .env file, add:

      ```bash
      HOST=YOUR_DB_ENDPOINT
      USER=YOUR_DB_USER
      PASSWORD=YOUR_PASSWORD
      DATABASE=YOUR_DATABASE
      ```

   2. In your server.js: 

      ```javascript
      var mysql = require('mysql');
      var con = mysql.createConnection({
         host : process.env.HOST,
         user : process.env.USER,
         password : process.env.PASSWORD,
         database = process.env.DATABASE
      });

      con.connect(function(err){
          if(err){
              console.log('Error connecting to DB');
              return;
          }
          console.log('Connection established');
      });
      ```

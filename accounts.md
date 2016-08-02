---
title: Accounts
layout: template
filename: accounts
---

## Managing Accounts

### User

Users can access all the data that they uploaded.

To prevent random users from overflowing the database, unregistered users are prohibited from uploading the data.

We plan on implementing OAuth to provide a more rigorous validation of users, to better protect the system.

#### Sign-Up

Users are asked to sign up when accessing the data.

This procedure hasn't been integrated with the android app yet.

After they sign up, their credentials are safely stored in the database.

#### Login

After Users log in, they don't have to log in again as long as they maintain an active session.

This is done with express-session.

Example Script :

```javascript

// boilerplate setup above ...

var session = require('express-session');

app.use(session({
	secret : 'MySecret',
	resave : false,
	saveUninitialized : true,
}));

app.get('/', function (req, res) {
	if(!req.session.userid){
		req.session.userid = 5;
		res.end("NOW LOGGED IN");
	}else{
		res.end("ALREADY LOGGED IN");
	}
});

//boilerplate setup below ...
```


### Admin

The Admin can view all the data present in the database.

---
title: MySQL
layout: template
filename: mysql
---

# MySQL

## Setting Up MySQL

As per [this guide](https://www.linode.com/docs/databases/mysql/install-mysql-on-ubuntu-14-04):

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install mysql-server
```

## Starting MySQL

```bash
sudo service mysql start
```

Alternatively, if you want to hold on to the process:

```bash
sudo mysqld_safe
```

## Connecting to MySQL

### Local Host

```bash
mysql -u ${user}
#Enter password: ...
#Welcome to ...
mysql> USE ${db}
```

Alternatively,

```bash
mysql -u${user} -p${pw} ${db}
```

### Remote Host

```bash
mysql -h ${host} -u${user} -p
#Enter password: ...
#Welcome to ...
mysql> USE ${db}
```

Alternatively,

```bash
mysql -h ${host} -u${user} -p${pw} ${db}
```

Replace **${host}**, **${user}**, and **${db}** with your own credentials.

Remember that you shouldn't put any spaces between -p and your password.

## Shutting Down MySQL Server

Try:

```bash
sudo mysqladmin -u root -p shutdown
```

If that didn't work, then your mysql-related executables are not under standard path. Run:

```bash
cd /
find -name 'mysql'
```

to find the installation path for your mysql.

Note: shutdown is **not** your password. It's a command.
You have to supply the password when prompted.

If mysqladmin is unable to shutdown the process, go to [here](http://stackoverflow.com/questions/11091414/how-to-stop-mysqld) and attempt the suggested methods.

## Basic Queries

I'm not going to teach you the basics of MySQL, which can be found [here](http://dev.mysql.com/doc/refman/5.7/en/).

For more advanced stuff, see the following tips:

### Check if a query exists

```bash
mysql> SELECT EXISTS(SELECT * from TABLE WHERE COLUMN = VALUE ...) as `exists`
```

### Encryption with AES

TIP : you may set BLOB as the datatype returned by AES_ENCRYPT.

To insert:

```bash
mysql> INSERT INTO TABLE (encrypted_field...) VALUE AES_ENCRYPT('SOME_PASSCODE'), ...
```

To Query:

```bash
SELECT * FROM TABLE WHERE encrypted_field = AES_ENCRYPT('SOME_PASSCODE') AND ...
```

## Installing Node MySQL Driver

You should have Node.js and NPM.

Otherwise, go to the [Node Tutorial](../Server-MongoDB/node).

```bash
npm install --save node-mysql
```

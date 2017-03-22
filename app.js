'use strict';

var express = require('express');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var config = require('./routes/config');
var assert = require('assert');

// Constants
//var PORT = 8080;

// Routes
var highscores = require('./routes/highscores');
var user = require('./routes/user');
var zone = require('./routes/zone');

// App
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Handle root web server's public directory
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/highscores', highscores);
app.use('/user', user);
app.use('/zone', zone);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
app.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

MongoClient.connect(config.database.url, config.database.options,
    function(err, db) {
        if (err) {
            console.log(err);
        } else {
            app.locals.db = db;
            console.log('Connected to database server successfully');
        }
});

module.exports = app;
//app.listen(PORT);
//console.log('Running on http://localhost:' + PORT);

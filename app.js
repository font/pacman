'use strict';

import express  from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import Database from './lib/database.js';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import highscores from './routes/highscores.js';
import user from './routes/user.js';
import loc from './routes/location.js';

// App
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade'); // "jade": "^0.29.0",
app.set('view engine', 'pug');

// Handle root web server's public directory
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/highscores', highscores);
app.use('/user', user);
app.use('/location', loc);

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
  res.locals.title = 'Pac-Man Error';
  res.locals.message = `Error message: ${err.message}`;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

Database.connect(app, function(err) {
  if (err) {
    console.log('Failed to connect to database server');
  } else {
    console.log('Connected to database server successfully');
  }
});

export default app;
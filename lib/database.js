'use strict';

import { MongoClient } from 'mongodb';
import { database } from './config.js';
var _db;

class Database {
  constructor() {
    this.connect = function (app, callback) {
      MongoClient.connect(database.url,
        database.options,
        function (err, client) {
          const db = client.db(database.name);
          if (err) {
            console.log('err=', err);
          } else {
            _db = db;
            app.locals.db = db;
          }
          callback(err);
        });
    };

    this.getDb = function (app, callback) {
      if (!_db) {
        this.connect(app, function (err) {
          if (err) {
            console.log('Failed to connect to database server');
          } else {
            console.log('Connected to database server successfully');
          }
          callback(err, _db);
        });
      } else {
        callback(null, _db);
      }
    };
  }
}

export default new Database(); // Singleton
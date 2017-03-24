'use strict';

var MongoClient = require('mongodb').MongoClient;
var config = require('./config');

function Database() {
    this.connect = function(app, done) {
            MongoClient.connect(config.database.url,
                                config.database.options,
                                function (err, db) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        app.locals.db = db;
                                    }
                                    done();
                                });
    }
}

var database = module.exports = exports = new Database(); // Singleton

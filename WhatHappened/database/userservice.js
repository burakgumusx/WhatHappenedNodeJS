var mongo = require('mongodb');
var mongodb = mongo.MongoClient;
var mongoUrl = 'mongodb://127.0.0.1:27017/WhatHappened';
var jwt = require('jwt-simple');
var global = require('../constants/constants');

exports.GetUser = function (res) {
    try {


        var data = [];
        mongodb.connect(mongoUrl, function (err, db) {
            db.collection('USERS').find().toArray(function (err, cursor) {
                cursor.forEach(function (row) {
                    data.push(row);
                });
                res.send(data, 200);
            });
            db.close();
        });
    }
    catch (err) {
        res.send(global.SOMETHING_WENT_WRONG, 500)
    }
};

exports.SaveUser = function (req, res) {

    try {
        
        mongodb.connect(mongoUrl, function (err, db) {
            db.collection('USERS', function (err, col) {
                col.save({
                    USERNAME: req.body.USERNAME,
                    PASSWORD: req.body.PASSWORD,
                    ADDRESS: req.body.ADDRESS
                }, function () {
                });
                SaveToken(req, res);
            });
            db.close();
        });
    }
    catch (err) {
        res.send(global.SOMETHING_WENT_WRONG, 500);
    }

}

function SaveToken(req, res) {
    try {


        var token = new Date().getTime();
        token = jwt.encode({"token": token.toString()}, 'shh', 'HS256');

        mongodb.connect(mongoUrl, function (err, db) {
            db.collection('AUTH', function (err, col) {
                var date = new Date(Date.now()).addDays(1);
                col.save({TOKEN: token, EXPIRE: date, IPADDRESS: req.connection.remoteAddress.toString()}, function () {
                });
            });
            db.close();
            res.send(token, 200);
        });
    }
    catch (err) {
        res.send(global.SOMETHING_WENT_WRONG, 500);
    }
}

exports.CheckToken = function (res, next, token) {
    try {
        if (token) {
            mongodb.connect(mongoUrl, function (err, db) {
                db.collection("AUTH").findOne({
                    "EXPIRE": {$gt: new Date(Date.now())},
                    TOKEN: token
                }, function (err, doc) {
                    if (doc == undefined || doc == null) {
                        res.end(global.PLEASE_LOGIN, 401);
                    }
                    else {
                        next();
                    }
                });
                db.close()
            });

        }
        else {
            res.end(global.TOKEN_REQUIRED, 400)
        }
    }
    catch (err) {
        res.end(global.SOMETHING_WENT_WRONG, 500);
    }
}


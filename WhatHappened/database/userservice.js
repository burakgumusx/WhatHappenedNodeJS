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
                res.json(data, 200);
            });
            db.close();
        });
    }
    catch (err) {
        res.json(global.SOMETHING_WENT_WRONG, 500)
    }
};

exports.RegisterUser = function (req, res) {
    var body = req.body;
    var password = jwt.encode(req.body.PASSWORD, 'shh', 'HS256');

    try {
        mongodb.connect(mongoUrl, function (err, db) {
            db.collection('USERS', function (err, col) {
                col.save({
                    USERNAME: body.USERNAME,
                    PASSWORD: password,
                    ADDRESS: body.ADDRESS
                }, function () {
                });
            });
            db.close();
            res.json(global.REGISTER_SUCCES, 200);
        });
    }
    catch (err) {
        res.json(global.SOMETHING_WENT_WRONG, 500);
    }

}
exports.Login = function (req, res, next) {

    var body = req.body;
    //var decode = jwt.decode(body.PASSWORD,'shh');
    try {
        mongodb.connect(mongoUrl, function (err, db) {
            db.collection('USERS').findOne({
                "USERNAME": body.USERNAME,
                "PASSWORD": body.PASSWORD
            }, function (err, doc) {

                if (doc != undefined || doc != null) {
                    SaveToken(req, res);
                }
                else {
                    res.json(global.PLEASE_LOGIN, 401);
                }
            });
        });
    } catch (err) {
        res.json(global.SOMETHING_WENT_WRONG,500);
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
            res.json(token, 200);
        });
    }
    catch (err) {
        res.json(global.SOMETHING_WENT_WRONG, 500);
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
                        res.json(global.PLEASE_LOGIN, 401);
                    }
                    else {
                        next();
                    }
                });
                db.close()
            });
        }
        else {
            res.json(global.TOKEN_REQUIRED, 400)
        }
    }
    catch (err) {
        res.json(global.SOMETHING_WENT_WRONG, 500);
    }
}


var express = require('express');
var router = express.Router();
var userService = require('../database/userservice.js');
var auth = require('../auth/auth');


router.get('/user', [auth.AuthCheck], function (req, res) {
    userService.GetUser(res);
});

router.post('/user', function (req, res) {
    userService.RegisterUser(req,res);
});

router.post('/login',function (req,res,next) {
   userService.Login(req,res,next)
});


module.exports = router;

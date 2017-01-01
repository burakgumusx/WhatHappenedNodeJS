var express = require('express');
var router = express.Router();
var userService = require('../database/userservice.js');
var auth = require('../auth/auth');


router.get('/user', [auth.AuthCheck], function (req, res) {
    userService.GetUser(res);
});

router.post('/user', function (req, res) {
    userService.SaveUser(req,res);
});


module.exports = router;

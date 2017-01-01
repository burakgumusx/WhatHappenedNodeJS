var userService = require('../database/userservice');


module.exports = {
    AuthCheck: function (req, res, next) {
        userService.CheckToken(res, next, req.query.access_token);
    }
}

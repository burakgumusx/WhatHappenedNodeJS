var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var helper = require('./helper/helper');
var index = require('./routes/index');
var userApi = require('./api/UserApi');

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/views',express.static(__dirname+'/views'));
app.use('/',userApi);
app.use('/',index);


io.on('connection', function(socket){
    console.log('a user connected '+socket.id);
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});
http.listen(8000,helper.localIpAddressV4,function(){

}); 
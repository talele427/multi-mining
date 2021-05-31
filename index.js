const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(4000, function(){
    console.log('eavesdropping');
});

app.use(express.static('public'));


var io = socket(server);

io.on('connection', function(socket){
    console.log('guest has logged in');
});
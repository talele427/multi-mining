const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const { setInterval } = require('timers');

const publicPath= path.join(__dirname, '/public');
const port=process.env.PORT || 4000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

var onlinePlayers=0;
var avOre=3;

app.use(express.static(publicPath));

server.listen(port, () => {
    console.log('listening @ %d',port);

})

io.on('connection', (socket) => {
    onlinePlayers++;
    socket.on('named', (name) => {
        console.log(name+' has joined the server @ ' + socket.id);
    });
    io.sockets.emit('getValues', onlinePlayers, avOre);
});

io.on('connection', (socket) =>{
    socket.on('disconnect', ()=>{
        console.log(socket.id+" has disconnected");
        onlinePlayers--;
        io.sockets.emit('getValues', onlinePlayers, avOre);
    });
});

io.on('connection',(socket)=>{
    socket.on('miner', ()=>{
        if(avOre>=0){
            avOre--;
            socket.emit('minerCon');
            io.sockets.emit('getValues', onlinePlayers, avOre);
        }
        else{
            io.sockets.emit('getValues', onlinePlayers, avOre);
        }
    })
})

function generateOre(){
    avOre=3;
    io.sockets.emit('getValues', onlinePlayers,avOre);
}

setInterval(generateOre, 10000);
                                        //Initiation
                                            //requires
const express = require('express');             //middle-ware
const path = require('path');                   //for http
const http = require('http');                   //http
const socketIO = require('socket.io');          //bi-directional communication
const { setInterval } = require('timers');      //timer
                                            //declarations
const publicPath= path.join(__dirname, '/public');      //for http
const port=process.env.PORT || 4000;                    //for http
let app = express();                                    //application
let server = http.createServer(app);                    //nodejs server with http and express app
let io = socketIO(server);                              //a socket on ^

var onlinePlayers=0;                        //server-side variables
var avOre=3;
var tim = 15000;

app.use(express.static(publicPath));        //middle-ware directory for public website

server.listen(port, () => {                 //nodejs constant eventlistener
    console.log('listening @ %d',port);

})

io.on('connection', (socket) => {           //entrance event
    onlinePlayers++;
    socket.on('named', (name) => {          //listening for name
        console.log(name+' has joined the server @ ' + socket.id);
    });
    io.sockets.emit('getValues', onlinePlayers, avOre);
});

io.on('connection', (socket) =>{
    socket.on('disconnect', ()=>{           //listening for disconnection
        console.log(socket.id+" has disconnected");
        onlinePlayers--;
        io.sockets.emit('getValues', onlinePlayers, avOre);
    });
});

io.on('connection',(socket)=>{              
    socket.on('miner', ()=>{                //listening for mine
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

function generateOre(){                     //global resource
    avOre=3;
    io.sockets.emit('getValues', onlinePlayers,avOre);
}

setInterval(generateOre, tim);            //timer
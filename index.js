                                        //Initiation
                                            //requires
const express = require('express');             //middle-ware
const path = require('path');                   //for http
const http = require('http');                   //http
const socketIO = require('socket.io');          //bi-directional communication
const { setInterval } = require('timers');      //timer
const mongoose = require('mongoose');           //for mongoDB
const User = require('./models/user');          //model for database
                                            //declarations
const publicPath= path.join(__dirname, '/public');      //for http
const port=process.env.PORT || 3000;                    //for http
const dbURI = 'mongodb+srv://soham:01010011@multi-mining.v2v2e.mongodb.net/player-data?retryWrites=true&w=majority';
let app = express();                                    //application
let server = http.createServer(app);                    //nodejs server with http and express app
let io = socketIO(server);                              //a socket on ^

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true}) //mongoDB connection
.then((result)=> server.listen(port, () => {                 //nodejs constant eventlistener
    console.log('listening @ %d',port);
    console.log('connected to database');
}))
.catch((err) => console.log(err));

var onlinePlayers=0;                        //server-side variables
var avOre=10;
var tim = 60000;
var maxOre=10;
var oreDonated =0;
var timDonated=0;
var timLevel=0;
var oreLevel=11;
var oreCost=0;
var timCost=0;

User.findOne({username:"admin"}, function(err,res){
    let admin = JSON.parse((JSON.stringify(res)));

    tim = 60000 - (admin.timLevel * 1000);
    oreDonated =admin.oreProgress;
    timDonated =admin.timProgress;
    timLevel=admin.timLevel;
    oreLevel=admin.oreLevel;
    oreCost = 10*(oreLevel/2) - oreDonated;
    timCost=100*(timLevel+1) - timDonated;
    let a =0;
    for(var i = 1; i<oreLevel;i++){
        a+=i;
    }
    maxOre=10+a;
    avOre=maxOre;
});

app.use(express.static(publicPath));        //middle-ware directory for public website



io.on('connection', (socket) => {           //entrance event
    
    socket.on('login', (name,pass) => {          //listening for name

        User.exists({username:name}, function (err, exist){
            if(err){
                console.log(err);
            }
            if(exist){
                User.findOne({ username:name}).lean().exec(function (err, res) {
                let user=JSON.parse((JSON.stringify(res)));    
                    if(pass==user.password){
                        onlinePlayers++;
                        socket.emit('loggedin',user.username);
                    } else{
                        socket.emit('wrong pass');
                    }
                }
            )}else{
            const user = new User({
                username: name,
                password: pass,
                ores: 0,
                donated: 0,
                totalMined: 0,
                autoMine: false,
                mineLevel: 1
            });
    
            user.save()
                .then((result) => {
                    onlinePlayers++;
                    console.log(name + ' has been added to the database');
                    socket.emit('loggedin',name);
                })
                .catch((err)=>{
                    console.log(JSON.parse((JSON.stringify(res))));
                });
            console.log(name+' has joined the server @ ' + socket.id);
            }
        })
        io.sockets.emit('getValues', onlinePlayers, avOre,oreCost,timCost);
    });    
});

io.on('disconnect', (socket) =>{
    socket.on('loggedOut', ()=>{           //listening for disconnection
        onlinePlayers--;
        io.sockets.emit('getValues', onlinePlayers, avOre, oreCost,timCost);
    });
});

io.on('connection',(socket)=>{              
    socket.on('miner', (level)=>{                //listening for mine
        let mined=0;
        for(var i = 1;i<=level;i++){
            if(avOre>0){
                avOre--;
                mined++;
            }
            else{
                io.sockets.emit('getValues', onlinePlayers, avOre, oreCost,timCost);
            }
        }
        socket.emit('minerCon', mined);
        io.sockets.emit('getValues', onlinePlayers, avOre,oreCost,timCost);
    })
})

io.on('connection', (socket)=>{
    socket.on('reqData', (name)=>{
        User.findOne({username:name}, function(err,res){
            let user=JSON.parse((JSON.stringify(res)));
            socket.emit('sendData', user.username,user.ores,user.autoMine,user.mineLevel,avOre,onlinePlayers);
            io.sockets.emit('getValues', onlinePlayers,avOre,oreCost,timCost);
        });
        
    });
});

io.on('connection', (socket)=>{
    socket.on('donateM', (donation)=>{
        oreCost-=donation;
        
        if(oreCost<=0){
            oreLevel++;
            maxOre+=oreLevel;
            oreCost=10*(oreLevel/2);
        }
        socket.emit('donateMCon', donation);
        io.sockets.emit('getValues', onlinePlayers,avOre,oreCost,timCost);
    })
})

io.on('connection', (socket)=>{
    socket.on('donateF', (donation)=>{
        timCost-=donation;
        
        if(timCost<=0){
            timLevel++;
            tim=60000-(timLevel*3000);
            timCost=100*(timLevel+1);
        }
        socket.emit('donateFCon', donation);
        io.sockets.emit('getValues', onlinePlayers,avOre,oreCost,timCost);
    })
})

io.on('connection', (socket)=>{
    socket.on('dbUpdate', (name, pores, mined, miner, pdonated, level)=>{
    
        User.updateOne({username:name},{ores:pores,donated:pdonated,autoMine:miner,
            totalMined:mined,mineLevel:level},function(err,res){});

    })
})

function generateOre(){                     //global resource
    avOre=maxOre;
    io.sockets.emit('getValues', onlinePlayers,avOre,oreCost,timCost);
}

function updServ(){
    let l = oreLevel;
    let f = timLevel;
    let o = 10*(l/2)-oreCost;
    let t = 100*(f+1)-timCost;

    User.updateOne({username:"admin"},{oreLevel:l,timLevel:f,oreProgress:o,
        timProgress:t},function(err,res){});
}

setInterval(generateOre, tim);            //timer

setInterval(updServ,tim);
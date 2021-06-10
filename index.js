                                        //Initiation
                                            //requires
const express = require('express');             //middle-ware
const path = require('path');                   //for http
const http = require('http');                   //http
const socketIO = require('socket.io');          //bi-directional communication
const { setInterval } = require('timers');      //timer
const mongoose = require('mongoose');           //for mongoDB
const Plr = require('./models/Plr');          //model for database
const Admin = require('./models/admin');
                                            //declarations
const publicPath= path.join(__dirname, '/public');      //for http
const port=process.env.PORT || 4000;                    //for http
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

var players=[];

var avOre=10;
var maxOre=10;
var timL=0;
var oreL=1;
var oreCost=0;
var timCost=0;

var tim = 60;
var regenProgress = 0;

Admin.findOne({username:"admin"}, function(err,res){
    let admin = JSON.parse((JSON.stringify(res)));

    oreCost =admin.oreCost;
    timCost =admin.timCost;
    timL=admin.timLevel;
    oreL=admin.oreLevel;
    let a =0;
    for(var i = 1; i<oreL;i++){
        a+=i;
    }
    maxOre=10+a;
    avOre=maxOre;
    if(tim<=10){
        tim=10;
        timCost=0;
    }

});

app.use(express.static(publicPath));        //middle-ware directory for public website

io.on('connection', (socket) => {           //entrance event login.js
    socket.on('login', (name,pass) => {          //listening for name
        
        Plr.exists({username:name}, function (err, exist){
            if(err){
                console.log(err);
            }
            if(exist){
                Plr.findOne({ username:name}).lean().exec(function (err, res) {
                let user=JSON.parse((JSON.stringify(res)));    
                    if(pass==user.password){
                        let b=players.find(obj=>obj.username==name);
                        if(b){
                            socket.emit('existedEntry');
                        }else{                   
                            socket.emit('loggedin',user.username);
                        }
                    } else{
                        socket.emit('wrong pass');
                    }
                }
            )}else{
            const user = new Plr({
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
                    console.log(name + ' has been added to the database');
                    socket.emit('loggedin',name);
                })
                .catch((err)=>{
                    console.log(JSON.parse((JSON.stringify(res))));
                });
            console.log(name+' has joined the server @ ' + socket.id);
            }
        })
        io.sockets.emit('getValues', players.length, avOre,oreCost,timCost);
    });    
});

io.on('connection', (socket) =>{            //logout
    socket.on('disconnect', ()=>{
        let b=players.find(obj=>obj.id==socket.id);
        if(b){
            updP(b);
            players.splice(players.indexOf(b),1);
            io.sockets.emit('getValues', players.length, avOre,oreCost,timCost);
        }
    });
});

function mine(p){                            //mine
    let b=p.mineLevel;
    let mined=0;
    for(var a = 0; a<b;a++){
        if(avOre>0){
            avOre--;
            mined++;
        }
    }
    p.ores+=mined;
    p.totalMined+=mined;
    io.sockets.emit('getValues', players.length, avOre,oreCost,timCost);
    io.sockets.emit('wild',p.ores,p.id);
}

io.on('connection',(socket)=>{              //listening for miner   
    socket.on('miner', ()=>{                
        let player=players.find(obj=>obj.id==socket.id);
        let i = players.indexOf(players.find(obj=>obj.id==socket.id));
        setTimeout(mine,5000,player);
    })
})

io.on('connection', (socket)=>{             //listening for reqData
    socket.on('reqData', (name,pass)=>{

        Plr.findOne({username:name}, function(err,res){
            let user=JSON.parse((JSON.stringify(res)));
            if(user.password==pass){
            
                user.id=socket.id;
                players.push(user);
                socket.emit('sendUser',user.username,user.ores,user.mineLevel,user.autoMine);
                socket.emit('plus');
                io.sockets.emit('getValues', players.length,avOre,oreCost,timCost);
            }else{
                socket.emit('niceTry');
            }
        });
        
    });
});

io.on('connection',(socket)=>{              //listening for autoMine
    socket.on('autoMine', ()=>{
        let player=players.find(obj=>obj.id==socket.id);
        if(player.autoMine){
            console.log('clicker game addict');
        }else{
            if(player.ores>5){
                player.autoMine=true;
                player.ores-=5;
            }
        }
        let user = player;
        socket.emit('sendUser',user.username,user.ores,user.mineLevel,user.autoMine);
        io.sockets.emit('getValues', players.length,avOre,oreCost,timCost);
    })
})

io.on('connection', (socket)=>{             //listening for donateM
    socket.on('donateM', ()=>{
        let player=players.find(obj=>obj.id==socket.id);
        if(player.ores>=oreCost){
            player.ores-=oreCost;
            oreL++;
            player.donated+=oreCost;
            oreCost=oreL/2*10+(oreL*oreL);
        } else{
            player.donated+=player.ores;
            oreCost-=player.ores;
            player.ores=0;
            if(oreCost<=0){
                oreL++;
                oreCost+=oreL/2*10+(oreL*oreL);
            }
        }    
        let user = player;
        socket.emit('sendUser',user.username,user.ores,user.mineLevel,user.autoMine);
        io.sockets.emit('getValues', players.length,avOre,oreCost,timCost);
    })
})

io.on('connection', (socket)=>{             //listening to donateF
    socket.on('donateF', ()=>{
        let player=players.find(obj=>obj.id==socket.id);
        if(player.ores>=timCost){
            player.ores-=timCost;
            player.donated+=timCost;
            timL++;
            timCost=90*(timL*timL);
        } else{
            player.donated+=player.ores;
            timCost-=player.ores;
            player.ores=0;
            if(timCost<=0){
                timL++;
                timCost=90*(timL*timL);
            }
        }    
        let user = player;
        socket.emit('sendUser',user.username,user.ores,user.mineLevel,user.autoMine);
        io.sockets.emit('getValues', players.length,avOre,oreCost,timCost);
    })
})

io.on('connection', (socket)=>{                                 //moreOre
    socket.on('moreOre',()=>{
        let player=players.find(obj=>obj.id==socket.id);
        let cost = player.mineLevel * 50 * (player.mineLevel/2);
        if(player.ores>=cost){
            player.ores-=cost;
            player.mineLevel++;
        } else{
            //loser
        }
        let user = player;
        socket.emit('sendUser',user.username,user.ores,user.mineLevel,user.autoMine);
        io.sockets.emit('getValues', players.length,avOre,oreCost,timCost);
    })
})

function generateOre(){                     //global resource
    avOre=maxOre;
    io.sockets.emit('getValues', players.length,avOre,oreCost,timCost);
}

function updServ(){
    var l = oreL;
    var f = timL;
    var o = oreCost;
    var t = timCost;
    for (var i = 0;i<oreL;i++){
        maxOre=10+i
    }
    tim=60-timL;
    Admin.updateOne({username:"admin"},{oreLevel:l,timLevel:f,oreCost:o,
        timCost:t},function(err,res){
        });
}

function updP(p){
    if(p){
        Plr.updateOne({username:p.username},{ores:p.ores,donated:p.donated,autoMine:p.autoMine,
            totalMined:p.totalMined,mineLevel:p.mineLevel},function(err,res){});
    }
}

function autos(){
    for(var i = 0;i<players.length;i++){
        if(players[i].autoMine){
            mine(players[i]);
        }
    }
}

function updateP(){
    let p=players[updater];
    updP(p);
    updater++;
    if(updater>=players.length){
        updater=0;
    }
    if(players.length>50){
        let p=players[updater];
        updP(p);
        updater++;
        if(updater>=players.length){
            updater=0;
        }
        if(players.length>100){
            let p=players[updater];
            updP(p);
            updater++;
            if(updater>=players.length){
                updater=0;
            }
        }
    }
}

function generOre(){
    regenProgress++;
    tim=60+1-timL;
    if(regenProgress>=tim){
        generateOre();
        regenProgress=0;
    }
}

//timer
var updater=0;

setInterval(generOre,1000);
setInterval(updServ,10000);
setInterval(autos,5000);
setInterval(updateP,2000);

setInterval(function() {
    regenProgress++;
    if(regenProgress < tim) return;
    regenProgress = 0;
    generateOre();
}, 1000);
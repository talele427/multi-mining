(function(){
    
const hero='https://multi-miner.herokuapp.com/';

var socket = io(hero); //client-side socket

var nametag = document.getElementById('nametag');           //HTML DOM variables
var yore = document.getElementById('oreDisplay');
var online = document.getElementById('online');
var btn = document.getElementById('button');
var btn2 = document.getElementById('button2');
var btn3 = document.getElementById('button3');
var btn4 = document.getElementById('button4');
var btn5 = document.getElementById('button5');
var fc = document.getElementById('forecost');
var mc = document.getElementById('morecost');
var mo = document.getElementById('moreore');
var am = document.getElementById('automine');
var sqr= document.getElementById('bg2');
var load = document.getElementById('loader');

var player = {
    username:"",
    ores:0,
    mined:0,
    miner: false,
    donated:0,
    level:0
}

function myFunction(){                  
    let name = localStorage.getItem('username');
    socket.emit('reqData', name);
}

socket.on('myCustomEvent', (data) => {
    socket.emit('dbUpdate', player.username,player.ores,player.mined,player.miner,player.donated,player.level);
})


socket.on('disconnect', ()=>{
    socket.emit('loggedOut');
});

socket.on('disconnect', ()=>{
    socket.emit('dbUpdate', player.username,player.ores,player.mined,player.miner,player.donated,player.level);
})

socket.on('sendData', (name, ores, miner, level,avOre,onlinePlayers)=>{
    player.username = name;
    player.ores = ores;
    player.miner = miner;
    player.level = level;
    online.innerHTML=onlinePlayers+ " online";
    sqr.innerHTML=avOre;
    if(player.miner==true){
        am.innerHTML="enabled";
        am.style.color="green";
    } else {
        am.innerHTML="10";
    }
    mo.innerHTML=player.level*50;
    setValues();
    if(player.miner){autominer()};
});

function mine(){
    if(loader.className!="anim"){                           //loader animation
        if(parseInt(sqr.innerHTML)>0){
            loader.className="anim";
            setTimeout(function(){
                loader.className="";
                socket.emit('miner',player.level);                       //emit mine
            },5000);
            
        }
    } 
}

myFunction();                                               //main 

function setValues(){                                    //saving cache
    nametag.innerHTML=player.username;
    yore.innerHTML=player.ores;
    mo.innerHTML=player.level*50;
}

socket.on('minerCon', (mined)=>{                                 //listening for mine confirmed
    player.ores+=mined;
    player.mined+=mined;
    yore.innerHTML=player.ores;
    setValues();
})

socket.on('getValues',(onlinePlayers, avOre,oreCost,timCost) =>{            //listening for server variables
    online.innerHTML=onlinePlayers+" online";
    sqr.innerHTML=avOre;
    if(avOre>99 && avOre<999){
        sqr.style.fontSize="900%";
        sqr.style.lineHeight="190%";
    } else if(avOre>999){
        sqr.style.fontSize="500%";
        sqr.style.lineHeight="300%";
    }
    fc.innerHTML=timCost;
    mc.innerHTML=oreCost;
    mo.innerHTML=player.level*50;
});

function autominer(){
    if(player.miner){
        loader.className="anim";
        loader.style.animationIterationCount=10;
        let a=0;
        setInterval(function(){
            a++;
            socket.emit('miner',player.level);                       //emit mine
            loader.className="anim";
            loader.style.animationIterationCount=10;
            if(a>9){
                a=0;
                loader.className="";
            }
            
        },5000);
    }
}

function automine(){
    console.log(player.ores);
    if(player.ores>=10){
        player.ores-=10
        setValues();
        console.log('hi');
        player.miner= player.miner ? false:true;
        autominer();
    }
}

function moreore(){
    if(player.ores>=player.level*50){
        player.ores-=player.level*50;
        player.level++;
    }
    setValues();
}

function donateMore(){
    let donation=parseInt(mc.innerHTML);
    if(player.ores>=donation){
        socket.emit('donateM',donation);
    }else {
        socket.emit('donateM',player.ores);
    }
}

socket.on('donateMCon', (donation)=>{

    player.ores-=donation;
    player.donated+=donation;
    setValues();
    socket.emit('dbUpdate', player.username,player.ores,player.mined,player.miner,player.donated,player.level);
})

function donateFore(){
    let donation=parseInt(fc.innerHTML);
    if(player.ores>=donation){
        socket.emit('donateF',donation);
    } else{
        socket.emit('donateF',player.ores);
    }
}

socket.on('donateFCon', (donation)=>{
    player.ores-=donation;
    player.donated+=donation;
    setValues();
    socket.emit('dbUpdate', player.username,player.ores,player.mined,player.miner,player.donated,player.level);
})

btn.addEventListener('click', mine);                        //local event listeners
btn2.addEventListener('click', automine);
am.addEventListener('click', automine);
btn3.addEventListener('click', moreore);
mo.addEventListener('click', moreore);
btn4.addEventListener('click', donateMore);
mc.addEventListener('click', donateMore);
btn5.addEventListener('click', donateFore);
fc.addEventListener('click', donateFore);

setInterval(function(){
    socket.emit('dbUpdate', player.username,player.ores,player.mined,player.miner,player.donated,player.level);
}, 30000);
    
})();

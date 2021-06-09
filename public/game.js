const hero='https://multi-miner.herokuapp.com/';

var socket = io(hero); //client-side socket

var nametag = document.getElementById('nametag'),           //HTML DOM variables
yore = document.getElementById('oreDisplay'),
online = document.getElementById('online'),
btn = document.getElementById('button'),
btn2 = document.getElementById('button2'),
btn3 = document.getElementById('button3'),
btn4 = document.getElementById('button4'),
btn5 = document.getElementById('button5'),
fc = document.getElementById('forecost'),
mc = document.getElementById('morecost'),
mo = document.getElementById('moreore'),
am = document.getElementById('automine'),
sqr= document.getElementById('bg2'),
loader = document.getElementById('loader');

function myFunct(){                  
    console.log('hi');
    let name = sessionStorage.getItem('username');
    let pass = sessionStorage.getItem('password');
    if(name){
        socket.emit('reqData', name,pass);
        console.log('hi');
    } else {
        alert('login error. please visit ' + hero);
    }
}

function mine(){
    if(loader.className!="anim"){                           //loader animation
        if(parseInt(sqr.innerHTML)>0){
            loader.className="anim";
            socket.emit('miner');                       //emit mine                   
        }
    } 
}

myFunct();                                               //main 

socket.on('wild', (ores,id)=>{
    if(id==socket.id){
        yore.innerHTML=ores;
    }
})

socket.on('sendUser', (uname, ores,mlevel,amine)=>{
    nametag.innerHTML=uname;
    yore.innerHTML=ores;
    mo.innerHTML=50*mlevel*(mlevel/2);
    if(amine){
        am.innerHTML="enabled";
        am.style.color="green";
    } else{
        am.innerHTML="12";
        am.style.color="black";
    }
})

socket.on('getValues',(onlinePlayers, avOre,oreCost,timCost) =>{            //listening for server variables
    online.innerHTML=onlinePlayers+" online";
    sqr.innerHTML=avOre;
    if(avOre>999){
        sqr.style.fontSize="500%";
        sqr.style.lineHeight="300%";
    } else if(avOre>99 && avOre<999){
        sqr.style.fontSize="900%";
        sqr.style.lineHeight="190%";
    } 
    fc.innerHTML=timCost;
    mc.innerHTML=oreCost;
});

socket.on('plus', ()=>{
    let a=online.innerHTML;
    online.innerHTML=a+" +1";
})

socket.on('niceTry', ()=>{
    sqr.innerHTML="login error"
    setTimeout(redirect,1000);
})

function redirect(){
    window.location.href="/index.html";
}

function automine(){
    if(am.innerHTML=="enabled" || am.style.color=="green"){
        console.log('stop it you clicker addict');
    }else {
        socket.emit('autoMine');
    }
}

function moreore(){
    socket.emit('moreOre');
}

function donateMore(){
    socket.emit('donateM');
}

function donateFore(){
    socket.emit('donateF');
}

btn.addEventListener('click', mine);                        //local event listeners
btn2.addEventListener('click', automine);
am.addEventListener('click', automine);
btn3.addEventListener('click', moreore);
mo.addEventListener('click', moreore);
btn4.addEventListener('click', donateMore);
mc.addEventListener('click', donateMore);
btn5.addEventListener('click', donateFore);
fc.addEventListener('click', donateFore);

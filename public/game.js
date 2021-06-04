var socket = io();

var nametag = document.getElementById('nametag');
var yore = document.getElementById('yore');
var online = document.getElementById('online');
var btn = document.getElementById('button');
var sqr= document.getElementById('square');
var load = document.getElementById('loader');


function myFunction(){
    if(localStorage.getItem("returning")==1){
        let ores=parseInt(localStorage.getItem("pOre"));
        yore.innerHTML=ores;
        let name=localStorage.getItem("pName");
        socket.emit('named', name);
        nametag.innerHTML = name;

    } else{
        var name = prompt("set a nickname", "");
        socket.emit('named', name);
        nametag.innerHTML=name;
    }
}

function mine(){
    if(loader.className!="anim"){
        if(parseInt(sqr.innerHTML)>0){
            loader.className="anim";
            setTimeout(function(){
                loader.className="";
                socket.emit('miner');
            },5000);
            
        }
    } 
}

myFunction();

function updateValues(){
    let ores=parseInt(yore.innerHTML);
    localStorage.setItem("returning", 1);
    localStorage.setItem("pOre", ores);
    localStorage.setItem("pName", nametag.innerHTML);
}

socket.on('minerCon', ()=>{
    let ores=parseInt(yore.innerHTML);
    ores++;
    yore.innerHTML=ores;
    updateValues();
})

socket.on('getValues',(onlinePlayers, avOre) =>{
    online.innerHTML=onlinePlayers+" online";
    sqr.innerHTML=avOre;
});

function deleteValues(){
    yore.innerHTML="0";
    localStorage.setItem("returning", 0);
    localStorage.setItem("pOre", 0);
    myFunction();
}

btn.addEventListener('click', mine);
nametag.addEventListener('click', deleteValues);
var socket = io('https://secret-tor-02907.herokuapp.com/'); //client-side socket

var nametag = document.getElementById('nametag');           //HTML DOM variables
var yore = document.getElementById('yore');
var online = document.getElementById('online');
var btn = document.getElementById('button');
var sqr= document.getElementById('square');
var load = document.getElementById('loader');


function myFunction(){                  
    if(localStorage.getItem("returning")==1){               //recurring user check
        let ores=parseInt(localStorage.getItem("pOre"));
        yore.innerHTML=ores;
        let name=localStorage.getItem("pName");
        socket.emit('named', name);
        nametag.innerHTML = name;

    } else{                                                 //emit name
        var name = prompt("set a nickname", "");
        socket.emit('named', name);
        nametag.innerHTML=name;
    }
}

function mine(){
    if(loader.className!="anim"){                           //loader animation
        if(parseInt(sqr.innerHTML)>0){
            loader.className="anim";
            setTimeout(function(){
                loader.className="";
                socket.emit('miner');                       //emit mine
            },5000);
            
        }
    } 
}

myFunction();                                               //main 

function updateValues(){                                    //saving cache
    let ores=parseInt(yore.innerHTML);
    localStorage.setItem("returning", 1);
    localStorage.setItem("pOre", ores);
    localStorage.setItem("pName", nametag.innerHTML);
}

socket.on('minerCon', ()=>{                                 //listening for mine confirmed
    let ores=parseInt(yore.innerHTML);
    ores++;
    yore.innerHTML=ores;
    updateValues();
})

socket.on('getValues',(onlinePlayers, avOre) =>{            //listening for server variables
    online.innerHTML=onlinePlayers+" online";
    sqr.innerHTML=avOre;
});

function deleteValues(){                                    //clear cache
    yore.innerHTML="0";
    localStorage.setItem("returning", 0);
    localStorage.setItem("pOre", 0);
    myFunction();
}

btn.addEventListener('click', mine);                        //local event listeners
nametag.addEventListener('click', deleteValues);
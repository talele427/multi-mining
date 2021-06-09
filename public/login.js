const hero='https://multi-miner.herokuapp.com/';

var socket = io(hero); //client-side socket

var username = document.getElementById('username');           //HTML DOM variables
var password = document.getElementById('pass');
var btn = document.getElementById('login');

function login(){
    if(username.value && password.value){
        sessionStorage.setItem('password',password.value);
        sessionStorage.setItem('username',username.value);
        socket.emit('login',username.value,password.value);
    } else {
        alert("please enter a username and a password. if you don't have an account it will be created automatically");
    }
}

socket.on('existedEntry', ()=>{
    alert("user already logged in");
});

socket.on('loggedin', (name)=>{
    window.location.href="/game.html";
});

socket.on('wrong pass', () => {
    alert("incorrect password or username already in use");
})

btn.addEventListener('click', login);
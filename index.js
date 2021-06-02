const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var ores=60;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});


server.listen(3000, () => {
    console.log('server running...');
});


  

io.on("connection", (socket) => {
    console.log("hello world");
    socket.on("miner", (arg) => {
        ores-=arg; // world
    });
});


// Dependencies
var express = require('express');
var http = require('http');
var uuid = require('uuid');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/', express.static(__dirname + '/static'));
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/static', 'index.html'));
  });
server.listen(5000, function() {
    console.log('Starting server on port 5000');
  });

var loggedUsers = {}

io.on('connection', function(socket) {
    var username;
    socket.emit('userlist', Object.keys(loggedUsers));
    socket.on('login', function(name){
        if(loggedUsers[name] == undefined){
            username = name;
            loggedUsers[name] = {
                id: socket.id,
                sock: socket,
                available: true,
                currentRoom: "0"
            }
            refreshUserList()
        }else{
            socket.emit("alreadylogged")
        }  
        
    });

    socket.on('disconnect', function(){
        if(username != undefined){
            console.log(username + " just disconnected!")
            delete loggedUsers[username]
            refreshUserList()
        }
    })

    socket.on('convite', function(convidado){
        console.log(username + " esta convidando " + convidado + " para jogar!")
        if(username != undefined && loggedUsers[username].available && loggedUsers[convidado] != undefined && loggedUsers[convidado].available){
            var sockConvidado = loggedUsers[convidado].sock;
            sockConvidado.emit('convite', username);
        }else{
            socket.emit('convitefalhou', convidado)
        }
    })

    socket.on('conviteaceito', function(convidador){
        console.log(`Preparando jogo entre ${username} e ${convidador}`);
        loggedUsers[username].available = false;
        loggedUsers[convidador].available = false;
        let sockConvidador = loggedUsers[convidador].sock;
        let gameid = uuid.v4();
        let xisoubola = ['x','o']
        let convidadorXisoubola = (Math.random()>0.5)? 1 : 0; 
        let convidadoXisoubola = 1 - convidadorXisoubola;
        
        socket.join(gameid);
        loggedUsers[username].currentRoom = gameid;
        socket.emit("newgame", gameid);
        socket.emit('xisoubola', xisoubola[convidadoXisoubola])
        sockConvidador.join(gameid);
        loggedUsers[convidador].currentRoom = gameid;
        sockConvidador.emit("newgame", gameid);
        sockConvidador.emit('xisoubola', xisoubola[convidadorXisoubola]);
    })

    socket.on('conviterecusado', function(convidador){
        var sockConvidador = loggedUsers[convidador].sock;
        sockConvidador.emit('convitefalhou', username)
    })

    socket.on('pedidojogada', function(jogada){
        let fromRoom = loggedUsers[username].currentRoom;
        io.in(fromRoom).emit('jogada', jogada);
    })

    socket.on('finaldapartida', function(myUsername){
        loggedUsers[myUsername].available = true;
        loggedUsers[myUsername].currentRoom = '0';
    })

    function refreshUserList(){
        let usernameList = Object.keys(loggedUsers);
        io.sockets.emit('userlist', usernameList);
    }
});

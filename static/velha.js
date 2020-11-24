var socket = io();
var userList = [];
var myUsername = "";
var xisoubola = "o";
var myTurn = true;


function casasIguais(a, b, c){
    var bgA = $("#casa"+a).css("background-image");
    var bgB = $("#casa"+b).css("background-image");
    var bgC = $("#casa"+c).css("background-image");
    if( (bgA == bgB) && (bgB == bgC) && (bgA != "none" && bgA != "")){
        if(bgA.indexOf("o.png") >= 0)
            vencedor = "O";
        else
            vencedor = "X";
        return true;
    }
    else{
        return false;
    }
}

function empate() {
    var casa1 = $("#casa1").css("background-image");
    var casa2 = $("#casa2").css("background-image");
    var casa3 = $("#casa3").css("background-image");
    var casa4 = $("#casa4").css("background-image");
    var casa5 = $("#casa5").css("background-image");
    var casa6 = $("#casa6").css("background-image");
    var casa7 = $("#casa7").css("background-image");
    var casa8 = $("#casa8").css("background-image");
    var casa9 = $("#casa9").css("background-image");

    if( (casa1 != "none" && casa1 != "") && (casa2 != "none" && casa2 != "") && (casa3 != "none" && casa3 != "") && (casa4 != "none" && casa4 != "") && (casa5 != "none" && casa5 != "") && (casa6 != "none" && casa6 != "") && (casa7 != "none" && casa7 != "") && (casa8 != "none" && casa8 != "") && (casa9 != "none" && casa9 != "")) {
        vencedor = "Empate";
        return true;
    } else {
        return false;
    }
}

function verificarFimDeJogo(){
    if( casasIguais(1, 2, 3) || casasIguais(4, 5, 6) || casasIguais(7, 8, 9) ||
        casasIguais(1, 4, 7) || casasIguais(2, 5, 8) || casasIguais(3, 6, 9) ||
        casasIguais(1, 5, 9) || casasIguais(3, 5, 7) || empate()
        ){
        if(vencedor=="Empate") {
            $("#resultado").html("<h1>O jogo empatou!</h1>");
        } else {
            $("#resultado").html("<h1>O jogador " + vencedor + " venceu! </h1>");
        }
        $('#resultado').show()
        //$(".casa").off("click");
        $(".casa").css({"pointerEvents":"none"})
        setTimeout(function(){ 
            $('#jogo').hide();
            $('#resultado').hide();
            $('#users').show();
            socket.emit("finaldapartida", myUsername);
        }, 5000);
    }
}

$(document).ready(function(){
    $('#loginform').submit(function(){
        if($('#logininput').val() != ""){
            socket.emit('login', $('#logininput').val());
            $('#loginform :input').prop("disabled", true);
            myUsername = $('#logininput').val()
            return false;
        }else{
            alert("Digite um nome mais bonito")
            return false;
        }
      });

      $(".casa").click(function(){
          if(myTurn && (($("#"+this.id).css("background-image") == "none") || ($("#"+this.id).css("background-image") == ""))) {
            myTurn = false;
            $("#resultado").html("<h1>Você é o "+ xisoubola.toUpperCase() +" e é a vez do seu adversário!</h1>");
            socket.emit('pedidojogada', [this.id, xisoubola])
          }
    });
      
    $(document).on('click','#btnconvite',function(){
        var convidado = this.parentElement.lastChild.innerText;
        socket.emit("convite", convidado);
    });
})

socket.on('jogada', function(jogada){

    let casa = jogada[0];
    let quem = jogada[1];
    if(quem != xisoubola){
        myTurn = true;
        $("#resultado").html("<h1>Você é o "+ xisoubola.toUpperCase() +" e é sua vez!</h1>");
    }
    let el = '#' + casa
    var bg = $(el).css("background-image");
    if(bg == "none" || bg == "" || myTurn)
    {           
        var fig = "url(" + quem + ".png)";
        $(el).css("background", fig); 
    }
    verificarFimDeJogo();
})

socket.on('userlist', function(users){
    userList = users;
        $('#user').empty();
        for (var username of userList) {
            if(username != myUsername){
                $('#user').append("<div class=\"newuser\"><button id=\"btnconvite\">Convidar!</button><p id=\"username\">" + username + "</p></div>"); 
            }else{
                $('#user').append("<div class=\"newuser\"><button id=\"btnconvite\" disabled=\"true\">Convidar!</button><p id=\"username\">" + username + "</p></div>"); 
            }          
    }
})

socket.on('alreadylogged', function(){
    $('#loginform :input').prop("disabled", false)
    alert("Ja existe um usuário logado com esse nome :(")
    myUsername = ""
   
})

socket.on('convitefalhou', function(convidado){
    alert(`${convidado} está indisponível no momento!`)
})

socket.on('convite',function(convidador){
    console.log(`${convidador} esta te convidando para jogar`);
    if(confirm(`Gostaria de jogar com ${convidador}?`)){
        socket.emit('conviteaceito', convidador);
    }else{
        socket.emit('conviterecusado', convidador)
    }
})

socket.on('newgame', function(gameid){
    console.log(gameid);
    $('#jogo').show();
    $("#resultado").show();
    $('#users').hide();
    $("#casa1").css("background-image", "none");
    $("#casa2").css("background-image", "none");
    $("#casa3").css("background-image", "none");
    $("#casa4").css("background-image", "none");
    $("#casa5").css("background-image", "none");
    $("#casa6").css("background-image", "none");
    $("#casa7").css("background-image", "none");
    $("#casa8").css("background-image", "none");
    $("#casa9").css("background-image", "none");
    $(".casa").css({"pointerEvents":"auto"})
})

socket.on('xisoubola', function(shizobola){
    xisoubola = shizobola;
    if(xisoubola == 'o') {
        myTurn = false
        $("#resultado").html("<h1>Você é o "+ xisoubola.toUpperCase() +" e é a vez do seu adversário!</h1>");
    } else {
        myTurn = true
        $("#resultado").html("<h1>Você é o "+ xisoubola.toUpperCase() +" e é sua vez!</h1>");
    }
})
var express     = require('express')
var app         = express();
var bodyParser  = require('body-parser');
var http 				= require('http');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017'


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});


app.post('/enviaQRCODE', function (req, resp) {
  let id    = req.body.id;
  let qr  = req.body.qr;

  MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
    if (err) throw err
    var query1 = { nome:  id};
    var query2 = { qr_code: qr};  
    var dbo = db.db("TrabalhoFinal");
    let preco;
    let desconto;
  
    res1 = await dbo.collection('user').find(query1).limit(1).toArray()
    res2 = await dbo.collection('produto').find(query2).limit(1).toArray()
    if (res1[0]==undefined) {
      if(res2[0]==undefined) {
        console.log("Não foi encontrado o usuário e o produto!");
        resp.send("Cliente e produto não encontrado!");
      } else {
        console.log("Não foi encontrado o usuário!");
        resp.send("Cliente não encontrado!");
      }
    } else {
      if(res2[0]==undefined) {
        console.log("Não foi encontrado o produto!");
        resp.send("Produto não encontrado!");
      } else {
        desconto = res1[0]['desconto']
        preco = res2[0]['preco']
        preco = preco - (preco*desconto/100);
        console.log("Novo preço para o cliente "+id+" : ", preco);
        resp.send({preco: preco});
      } 
    }
    
    resp.end();

  })


});

app.listen(8080);
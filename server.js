var mongo = require('mongodb').MongoClient,
client = require('socket.io').listen(8080).sockets;

var express = require("express");
var app     = express();
var path    = require("path");
var port = process.env.PORT || 3000;
var db = "YOUR DATABASE HERE";

app.use(express.static(path.join(__dirname, '/')));

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});

app.listen(port, function(){
  console.log("Your app is ready at http://localhost:"+port)
});


mongo.connect(db, function(err, db) {
  if(err) throw err;
  client.on('connection', function(socket) {

    var col = db.collection('messages'),
    sendStatus = function(s){
      socket.emit('status', s);
    };

    //Emit all the messages
    col.find().limit(100).sort({_id: 1 }).toArray(function(err, res){
      if(err) throw err;
      socket.emit('output', res);
    });
    //wait for input
    socket.on('input', function(data) {
      var name = data.name,
      message = data.message,
      whiteSpacePattern = /^\s*$/;

      if(whiteSpacePattern.test(name) || whiteSpacePattern.test(message)){
        sendStatus('Name and message are required!')
      }else {
        col.insert({name: name, message: message}, function(){
          client.emit('output',[data]);
          sendStatus({
            message : 'Message sent.',
            clear: true
          });
        });
      }

    });

  });
});

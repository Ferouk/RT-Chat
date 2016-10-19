(function() {
  var getNode = function(s){
    return document.querySelector(s);
  },
  //Get required nodes
  status = getNode('.status span'),
  textarea = getNode('.message'),
  messages = getNode('.messages'),
  chatName = getNode('.name-input'),
  statusDefault = status.textContent,
  setStatus = function(s) {
    status.textContent = s;
    if (s !== statusDefault) {
      var delay = setTimeout(function() {
        setStatus(statusDefault);
        clearInterval(delay);
      }, 3000);
    }
  };

  try{
    var socket = io.connect("http://127.0.0.1:8080");
  }catch(e){
    //Set status to warn user

  }

  if(socket !== undefined){
    //listen for output
    socket.on('output', function(data) {
        // Loop through the results
        for(var x = 0; x<data.length; x = x + 1){
          var message = document.createElement('p'),
          name = document.createElement('span');
          message.setAttribute('class','chat-msg');
          name.setAttribute('class','name');
          message.innerHTML = '<span class="name">'+data[x].name +':</span> '+ '<span class="msg">'+twemoji.parse(data[x].message, {size:16})+'</span>';

          //Append
          messages.appendChild(message);
          messages.insertBefore(message, messages.firstChild);

        }
    });

    //Listen for a status
    socket.on('status', function(data) {
        setStatus((typeof data === 'object') ? data.message : data);
        if(data.clear === true){
          textarea.value = '';
        }
    });


    //Listen for keydown
    textarea.addEventListener('keydown', function(event) {
      var self = this;
      name = chatName.value;
      if(event.which === 13 && event.shiftKey === false){
        socket.emit('input',{
          name : name,
          message : self.value
        });

        event.preventDefault();
      }
    });
  }

})();

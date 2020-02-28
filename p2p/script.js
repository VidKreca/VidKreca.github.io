// PeerToPeer

var myId;
var peer, conn;
var connected = false;


window.onload = function () {

  var btn = document.querySelector('#submit');
  var idElement = document.querySelector('#peerId');
  var messageElement = document.querySelector("#message");
  var sendMsg = document.querySelector("#sendMsg");
  var dataElement = document.querySelector("#data");


  peer = new Peer();

  // Display and save our ID
  peer.on('open', function(id) {
    myId = id;
    document.querySelector("#currentId").innerHTML = myId;
  });



  // Connect button clicked
  btn.addEventListener('click', function(event) {
    // Connect to given ID
    connect(idElement.value);
  });


  // Someone connected to us
  peer.on('connection', function(conn) {

    // Connect back
    if (!connected) {
      connect(conn.peer);
    }
    console.log(conn.peer + " connected");

    // Received a message
    conn.on('data', function(data){
      dataElement.innerHTML += data + "<br>";
      console.log(data);
    });
  });
}



function connect(peerId) {
  conn = peer.connect(peerId);
  connected = true;


  // Connection opened
  conn.on('open', function() {

    // Connection opened and sendMsg button clicked
    sendMsg.addEventListener('click', function(event) {
      conn.send(message.value);
    });
  });
}

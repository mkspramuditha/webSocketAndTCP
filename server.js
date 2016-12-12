/**
 * Created by shan on 12/12/16.
 */


var WebSocketServer = require('websocket').server;
var net = require('net');
var http = require('http');
var mapping = [];

var HOST = '127.0.0.1';
var PORT = 3000;

var webSocketId;
var tcpId;

var websocketClient;
var tcpClient;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

function setMappingWebSocket(sock,webSocketId) {
    for(var k = 0; k < mapping.length; k++){
        if(mapping[k][1].id == webSocketId){
            mapping[k][0] = {id:webSocketId , socket:sock};
            tcpClient = mapping[k][1].socket;
            console.log(mapping);
            return true;
        }
    }
    mapping.push([{id:webSocketId,socket:sock},null]);
    tcpClient = null;
    console.log(mapping);
    return true;
}

function setMappingTcpSocket(sock,tcpSocketId) {
    for(var k = 0; k < mapping.length; k++){
        if(mapping[k][0].id == tcpSocketId){
            mapping[k][1] = {id:tcpSocketId , socket:sock};
            websocketClient = mapping[k][0].socket;
            console.log(mapping);
            return true;
        }
    }
    mapping.push([null,{id:tcpSocketId,socket:sock}]);
    websocketClient = null;
    console.log(mapping);
    return true;
}

function sendTcpMessage(message){
    if(tcpClient!= null){
        tcpClient.write(message);
        console.log('message sent');
    }
    else{
        console.log('no tcp client initialized');
    }
}

function sendWebSocketMessage(message){
    console.log(message);
    if(websocketClient!= null){
        websocketClient.sendUTF("shan".utf8Data);
        console.log('message sent');
    }
    else{
        console.log('no webSocket client initialized');
    }
}


wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    console.log("shan");
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed originn
        console.log("sha");
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {

        // if (message.type === 'utf8') {
        //     console.log('Received Message: ' + message.utf8Data);
        //     connection.sendUTF(message.utf8Data);
        // }
        // else if (message.type === 'binary') {
        //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        //     connection.sendBytes(message.binaryData);
        // }
        webSocketId = message.utf8Data.slice(0,5);
        setMappingWebSocket(connection,webSocketId);
        sendTcpMessage(message.utf8Data);

    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});



net.createServer(function(sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        tcpId = data.toString().slice(0,5);
        console.log(websocketClient);
        setMappingTcpSocket(sock,tcpId);
        console.log(data);
        sendWebSocketMessage(data.toString);

        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        sock.write('You said "' + data + '"');
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);


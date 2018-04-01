// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'Student.io';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');


/**
 * Global variables
 */
// latest 100 messages
var history = [];
// list of currently connected clients (users)
var clients = [];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
// ... in random order
colors.sort(function (a, b) { return Math.random() > 0.5; });

/**
 * HTTP server
 */


var url = require("url");
var st = require('node-static');

var fileServer = new st.Server('./');

var server = http.createServer(function (request, response) {


    // Not important for us. We're writing WebSocket server, not HTTP server


    var _get = url.parse(request.url, true).query;
    fileServer.serve(request, response);



});

server.listen(webSocketsServerPort, function () {
    console.log((new Date()) + " Student.io Started ");
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
    console.log((new Date()) + " Site Address : http://localhost:" + webSocketsServerPort);
    // console.log((new Date()) + " Side Address : http://192.168.43.203:" + webSocketsServerPort);


});


/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});
var connections = [];
// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function (request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event

    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    /* if (history.length > 0) {
        connection.sendUTF(JSON.stringify({ type: 'history', data: history }));
        
    }
*/
    function GoTo() {
        connection.sendUTF({ type: 'file', data: newpath });
    }
    // user sent some message
    connection.on('message', function (message) {
        var jsonMessage=JSON.parse(message.utf8Data);
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name

                userName = htmlEntities(jsonMessage.Message);
                // get random color and send it back to the user
                userColor = colors.shift();
                connections.push({ UserName: userName, Connection: connection });
                console.log(connections)
                connection.sendUTF(JSON.stringify({ type: 'color', data: userColor,userName:userName }));
                console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.');
            }



            else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                    + userName + ': ' + jsonMessage.Message);
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(jsonMessage.Message),
                    author: userName,
                    color: userColor

                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type: 'message', data: obj });
                
                for (var i = connections.length - 1; i >= 0; i--) {
                    //clients[i].sendUTF(json);
                    //connection.send(JSON.stringify({Receiver:userName,Message:msg}));
                    if (connections[i].UserName==jsonMessage.Receiver || connections[i].UserName==userName) {
                        connections[i].Connection.sendUTF(json);
                    }
                    
                    //clients[i].sendUTF(json);

                }

            }
        }
    });

    // user disconnected
    connection.on('close', function (connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + ' ' + userName
                + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});

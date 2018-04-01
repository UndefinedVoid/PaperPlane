// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'Student.io';

// Port where we'll run the websocket server
var webSocketsServerPort = 4000;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var mongoDb = require('mongodb').MongoClient;

/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];
var dbUrl = "mongodb://localhost:27017/";
/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/**
 * HTTP server
 */
 

var url = require("url");
var st = require('node-static');

var fileServer = new st.Server('./');
 
var server = http.createServer(function(request, response) {

 
// Not important for us. We're writing WebSocket server, not HTTP server


var _get = url.parse(request.url, true).query;
fileServer.serve(request, response);

	
});
   
server.listen(webSocketsServerPort, function() {
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

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
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
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            console.log((new Date())+' Client Sent ChatRoom Request : '+message.utf8Data);
  	     var array = message.utf8Data.split(','),
    		 a = array[0], b = array[1];
	
//DB Call
mongoDb.connect(dbUrl, function(err, db, request, response) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var user={UserName:a,PassWord:b};

 dbo.collection("users").findOne({UserName:user.UserName}, function(err, result) {
    if (err) throw err;
	if (result!=null) {
	    console.log("User : " + result.UserName+" already exists.");
	     connection.sendUTF(JSON.stringify( { type: 'name', data: result.UserName} ));	   
	    
	}
	else {
	  dbo.collection("users").insertOne(user, function(err, res) {
	    if (err) throw err;
	    console.log("User Inserted : " + a);
            connection.sendUTF(JSON.stringify( { type: 'color', data:a} ));
	    
	  });
	}
    db.close();

  });
});
// End of db call
            }
        
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) +' '+userName
                 + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});

// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'Student.io';
 
// Port where we'll run the websocket server
var webSocketsServerPort = 2010;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require("fs");
var mongoDb = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/";
/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

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
    a = array[0], b = array[1], c = array[2];
	
//DB Call
mongoDb.connect(dbUrl, function(err, db) {
  if (err) throw err;
  var dbo = db.db("gendb");
  var user={ChatName:a,Purpose:b,Admin:c};

 dbo.collection("grp").findOne({UserName:user.ChatName}, function(err, result) {
    if (err) throw err;
	if (result!=null) {
	    console.log("Group : " + result.ChatName+" already exists.");
	     connection.send(JSON.stringify( { type: 'already', data: 'asdfgh'} ));	   
	}
	else {
	  dbo.collection("grp").insertOne(user, function(err, res) {
	    if (err) throw err;
	    console.log("Group Created : " + a+'.html');
            connection.send(JSON.stringify( { type: 'inserted', data:'a'} ));
	   
	    fs.mkdir(a);
            var tempFile = fs.readFileSync('chatTemp.html','utf8')    
            var html5 = tempFile.replace(new RegExp('{grp}','g'),a);
           var createStream = fs.createWriteStream(a+'.html');
		createStream.write(html5);
                createStream.end();
                var json = JSON.stringify({ type:'success', data: 'asd' });
                connection.sendUTF(json);	
	  });
	}
    db.close();

  });
});
// End of db call

			}
             else{ //TODO 
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

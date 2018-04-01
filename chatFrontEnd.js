$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false; 

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    // var connection = new window.WebSocket('ws://localhost:1337');
     var connection = new window.WebSocket('ws://192.168.43.203:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
	
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                           json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text,
                       json.data.color, new Date(json.data.time));
        } 
	 else if (myName === 'Server') { // it's a single message
           
            alert("You Can't Use That Username.");
	    window.location.href=('index.html');	
        } 	
	 else if (myName === 'server') { // it's a single message
           
            alert("You Can't Use That Username.");
	    window.location.href=('index.html');	
        } 	
     else if (myName === 'Divy') { 
	   	
            var DivyPass = prompt('Enter The PassWord...');
            if (DivyPass === 'Pikachu@123') {
	alert('Welcome Divy');}
	else {
		alert('Forgot PassWord!');
		window.location.href=('frontEnd.html');
		}		
        } 
	else if (myName === 'divy') { 
	   	
            var DivyPass = prompt('Enter The PassWord...');
            if (DivyPass === 'Pikachu@123') {
	alert('Welcome Divy');}
	else {
		alert('Forgot PassWord!');
		window.location.href=('frontEnd.html');
		}		
        } 
	else if (myName === 'DiVy') { 
	   	
            var DivyPass = prompt('Enter The PassWord...');
            if (DivyPass === 'Pikachu@123') {
	alert('Welcome Divy');}
	else {
		alert('Forgot PassWord!');
		window.location.href=('frontEnd.html');
		}		
        } 
	else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {

            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user is their name
            if (myName === false) {
		
                myName = msg;
		
            }
        }
    });
 /* function SendFile() {
	var files = document.getElementById('file').data;
  for (var x=0; x < e.dataTransfer.files.length; x++) {

    // instantiate a new FileReader object
    var fr = new FileReader();

    // loading files from the file system is an asynchronous
    // operation, run this function when the loading process
    // is complete
    fr.addEventListener("loadend", function() {
      // send the file over web sockets
     connection.send(fr.result);
    });

    // load the file into an array buffer
    fr.readAsArrayBuffer(file);
  }
} */
    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 4 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Oops!');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 4000);

    /**
     * Add message to the chat window
     */
    function addMessage(author, message, color, dt) {
	if (author == 'Server') {
        content.prepend('<p style="border-radius:5px;background-color:red;color:white;"><span style="color:white;">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');}
 	else {
	 content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');}
	
    }
});

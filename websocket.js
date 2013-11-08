#!/usr/bin/env node
/*
 * @file websocket.js
 * @description send 1024 bytes chunks
 * over websocket to measure raw speed
 * of msg/s that can be delivered.
 */
'use strict';
var crypto = require('crypto')
  , http = require('http')
  , websocket = require('websocket')

// tcp port
var port = 8081;

// nb of msg to send
var msg_target = parseInt(process.argv[2], 10) || 10000;

// message count
var msg_nb = 0;

// failed reception count
var err_nb = 0;

// message
var msg = crypto.randomBytes(1024).toString('hex');

// Create server
var server = http.createServer(function(request, response) {
	response.writeHead(404);
	response.end();
});
server.listen(port, function() {
    console.log('Server is listening on port', port);
});

// connect ws
var wsServer = new websocket.server({
	httpServer: server,
	autoAcceptConnections: false
});

// Server listening handler
wsServer.on('request', function(request) {
	var connection = request.accept('test-protocol', request.origin);
    connection.on('message', function(data) {
		if (msg != data) err_nb++;
		msg_nb++;
		if (msg_nb == msg_target) process.exit()
	});
});

var client = new websocket.client();

// error handling
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(socket) {
	// client emitter
    socket.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    socket.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
	for (var i=0; i<=msg_target; i++) {
		setImmediate(function(){
			socket.sendUTF(msg);
		})
	}
});

// connect client
client.connect('ws://localhost:'+port+'/', 'test-protocol');

// on exit
process.on('exit', function(){
	err_nb += (msg_target - msg_nb);
	var err_rate = Math.round((1 - (msg_nb/msg_target)) * 100);
	console.log('Emitted msg:', msg_nb);
	console.log('Err. rate:', err_rate + '%');
});

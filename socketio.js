#!/usr/bin/env node
/*
 * @file socketio.js
 * @description send 1024 bytes chunks
 * over websocket to measure raw speed
 * of msg/s that can be delivered.
 */
'use strict';
var crypto = require('crypto')
  , server = require('socket.io')
  , client = require('socket.io-client')

// tcp port
var port = 8080;

// nb of msg to send
var msg_target = parseInt(process.argv[2], 10) || 10000;

// message count
var msg_nb = 0;

// failed reception count
var err_nb = 0;

// message
var msg = crypto.randomBytes(1024).toString('hex');

// connect
var server = server.listen(port);
server.configure(function () {
	server.set('transports',['websocket']);
	server.set('log level', 1); // Errors and warnings
	server.set('match origin protocol', true);
	server.enable('browser client minification');
	server.enable('browser client etag');
	server.enable('browser client gzip');
});

// client definition
client = client.connect('localhost', {
	'port': port,
	'reconnect': true,
	'reconnection delay': 1000,
	'max reconnection attempts': 'infinity',
	'transports' : ['websocket']
});

// Server listening handler
server.sockets.on('connection', function (socket) {
	socket.on('message', function (data) {
		if (msg != data) err_nb++;
		msg_nb++;
		if (msg_nb == msg_target) process.exit()
	});
});

// Error handling
client.on('error', function (data) {
	console.error("socket", data);
});

client.once('connect', function() {
	// client emitter
	for (var i=0; i<=msg_target; i++) {
		client.send(msg.toString(), 0, msg.length, port, 'localhost');
	}
});

// on exit
process.on('exit', function(){
	err_nb += (msg_target - msg_nb);
	var err_rate = Math.round((1 - (msg_nb/msg_target)) * 100);
	console.log('Emitted msg:', msg_nb);
	console.log('Err. rate:', err_rate + '%');
})
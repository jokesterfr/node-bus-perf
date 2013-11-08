#!/usr/bin/env node
/*
 * @file udp-test.js
 * @description send 1024 bytes chunks
 * over udp datagrams to measure raw speed
 * of msg/s that can be delivered.
 */
'use strict';
var dgram = require('dgram')
  , crypto = require('crypto')
  , server = dgram.createSocket('udp4')
  , client = dgram.createSocket('udp4')

// nb of msg to send
var msg_target = parseInt(process.argv[2], 10) || 10000;

// if we try to overflow the udp server
var burst_mode = process.argv[3] ? true : false;

// tcp port
var port = 41234;

// message count
var msg_nb = 0;

// failed reception count
var err_nb = 0;

// message
var msg = crypto.randomBytes(1024);
var msgstr = msg.toString('hex');

// error management
server.on('error', function (err) {
	console.log('server error:\n' + err.stack);
	server.close();
});

// msg management
server.on('message', function (data) {
	if (msgstr != data.toString('hex')) err_nb++;
	msg_nb++;
	if (msg_nb == msg_target) process.exit()
});

// serveur listener
server.on('listening', function () {
	var address = server.address();
	console.log('server listening', address.address + ':' + address.port);
});
server.bind(port);

// client emitter
if (burst_mode) {
	for (var i=0; i<msg_target; i++) {
		client.send(msg, 0, msg.length, port, 'localhost');
	}
	setTimeout(function(){
		console.log('max timeout 2s reached');
		process.exit(1);
	}, 2000);
} else {
	var emit_cb = function() {
		client.send(msg, 0, msg.length, port, 'localhost', function() {
			if (msg_nb<msg_target) return emit_cb();
		});
	}
	emit_cb();
}

// on exit
process.on('exit', function(){
	err_nb += (msg_target - msg_nb);
	var err_rate = Math.round((1 - (msg_nb/msg_target)) * 100);
	console.log('Emitted msg:', msg_nb);
	console.log('Err. rate:', err_rate + '%');
})
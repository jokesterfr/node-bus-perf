#!/usr/bin/env node
/*
 * @file evtemit.js
 * @description send 1024 bytes chunks
 * over evtEmitter to measure raw speed
 * of msg/s that can be delivered.
 */
'use strict';

var crypto = require('crypto')
  , EventEmitter = require('events').EventEmitter
  , server = new EventEmitter();

// nb of msg to send
var msg_target = parseInt(process.argv[2], 10) || 1000000;

// message count
var msg_nb = 0;

// failed reception count
var err_nb = 0;

// 1024 bytes message
var msg = crypto.randomBytes(1024).toString('hex');

// error management
server.on('error', function (err) {
	console.log('server error:\n' + err.stack);
	server.close();
});

// msg management
server.on('message', function (data) {
	if (msg != data) err_nb++;
	msg_nb++;
});

// client emitter
for (var i=0; i<msg_target; i++) {
	server.emit('message', msg);
}

// on exit
process.on('exit', function(){
	err_nb += (msg_target - msg_nb);
	var err_rate = Math.round((1 - (msg_nb/msg_target)) * 100);
	console.log('Emitted msg:', msg_nb);
	console.log('Err. rate:', err_rate + '%');
})
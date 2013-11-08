#!/usr/bin/env node
/*
 * @file ipc.js
 * @description send 1024 bytes chunks
 * over IPC to measure raw speed
 * of msg/s that can be delivered.
 */
'use strict';
var crypto = require('crypto')
  , EventEmitter = require('events').EventEmitter
  , fork = require('child_process').fork
  , server = fork(__dirname + '/child_ipc.js')

// nb of msg to send
var msg_target = parseInt(process.argv[2], 10) || 100000;

// message count
var msg_nb = 0;

// failed reception count
var err_nb = 0;

// 1024 bytes message
var msg = 'fb2a61331aa652b91b3ad05964aa030c9a1034633eb8bc33dc36bc29b6c7c817e11172f8653f723be8779982b92f381caa02fbc823bd15b9fa9b3de3f63426f4dd03de1701203c123d871d92619f3c124999e4137e7dcf66edb79182c10fad3055c7be194efb360f24a17ee39268aa13562c54532f5edc293db0c7dcf168e63d54ace8273f338ac2c8b9c81a91660664c6528a5d63db741d6eaf2a55193d2e968597bcb45ab4615e58c03a47974d67081adecbaed9f94760b76bcffba40a855261f96f0d8773eefe837e81c27b55c59c934b9b2f7150c329c7453c91fbcc4f7f49b6af6a18a1cc7e7f3f2caea412ae4c1bee1fbf302ed054b6154cf10ae87db8c7a34282f96c4615b3f5bb7143ee19c2943eb9e97bf592baf075128e468191a1e9bba1b255112b58477ab408f88376759ba08c54dff537d1b7bea4def63176c48ee72f1bf3cf3232c91832052bf12d6e4fcaf961657802098195a18c39c8b92c8255bab926963e5f623ccd4d23d9db93dcfcb3cdfa62016789b23595070739e1caee86141f1a7738588ddb94a58b253bb779de2592a62f799eebfd795e4e07d53f96512893acf9fa6bf890a49aa71783117ec1f87f26d2662128721cba312a63f0f65182c5ba9aca051d58c8025a7dc6122823c568aaae99010509ae16224b50365f798da588036b32e7087000509678f03410db6e6b9a167dd67ddff30cf66cc7b1d1065cff5472d476251dcab5bc9364b4092bcd4d6cfa61595e53d547972f82dc2cf70d6446b605db9866084685ef3e55b6adad01b8bf4e7e417c10beee9638ef7248aa9378dd5c0e53ec6084ad67bd326a6fea5f4faf46e1f09cf1bb262a7929e9018e4e6e5c828b3040b5e1ab1bb09b805983864f1c33a6e37aecb194914e91889867cc3336cbe01d46d8721df9c7940f9f47ad6652fcef9152d18c17791cf49297f0d2695d270928c4f98edb7b005d9fe254e80b5611ede82f811c768396d705fe22ad147496469e4c95f5d5330c467592beb89039d0e48a313a31b86f3417c0577958aa89adba2b9f034d4ac9d1a9933ed60a8eae983e769073c03153b1c0072b180be031f78b15f8908356bcd7113f451c92cab81ae22c7c1b9488ee9236619e6e84c81ff86b9417b531bf2e4b18e15ce3b74178272d74132902c760b38bdfeb107271e48bdc1c73fe34e3962231124cfb5cb9903e2b7be07c1e410a4b9d1b479a46bc92bf3b8497d8ded374d885db5a4b940e3113acaae81bbb98f35ec546c2e8ae5cf06583bdb51ed9f3ecc5c54db60dddd6afff9edba274e2f4aff6e9763c176a8c9152dee121c0387e04708ece3c11a5a1a0a25cdc6c3db10cc34475854945ebf9fb741225fe6c44e4be29794e8f71beb0bc335bf675b594e80bd93b83367e5f1c82f13c6cd39f00fd0009fe549725b9b7a4ddbfab783e077d24';

// msg management
server.on('message', function (data) {
	if (data != msg) err_nb++;
	msg_nb++;
	if (msg_nb == msg_target) process.exit()
});

// start now
server.send({limit: msg_target});

// on exit
process.on('exit', function(){
	err_nb += (msg_target - msg_nb);
	var err_rate = Math.round((1 - (msg_nb/msg_target)) * 100);
	console.log('Emitted msg:', msg_nb);
	console.log('Err. rate:', err_rate + '%');
})
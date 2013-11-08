all: node_modules
	time ./evtemit.js 100000
	time ./ipc.js 100000
	time ./udp.js 100000
	time ./udp.js 1000 burst
	time ./socketio.js 10000
	time ./websocket.js 10000

node_modules:
	npm install

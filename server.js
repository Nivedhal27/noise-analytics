const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- IMPORTANT: CHECK YOUR COM PORT ---
// Change 'COM3' to the port you see in your Arduino IDE
const MY_COM_PORT = 'COM3'; 

const port = new SerialPort({ path: MY_COM_PORT, baudRate: 115200 });
// Change this line in your server.js:
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
app.use(express.static('public'));

parser.on('data', (data) => {
    const values = data.split(',');
    if (values.length === 2) {
        const payload = {
            roomA: parseInt(values[0]),
            roomB: parseInt(values[1]),
            timestamp: new Date().toLocaleTimeString()
        };
        io.emit('soundData', payload);
        console.log(`Live Data -> Room A: ${payload.roomA} | Room B: ${payload.roomB}`);
    }
});

server.listen(3000, () => {
    console.log('Backend started! Dashboard at http://localhost:3000');
});
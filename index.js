import { SerialPort } from 'serialport'
import { ReadlineParser } from 'serialport'
import express from 'express'//Express
import * as http from 'http'
import { Server } from 'socket.io'

const app = express();
const server = http.createServer(app);
const serverPort = 3000;
const io = new Server(server);

app.use(express.static('public'))

const protocolConfiguration = {
   path: 'COM3',
   baudRate: 9600
}

const port = new SerialPort(protocolConfiguration);
const parser = port.pipe(new ReadlineParser());

//Server /////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
   res.send('<h1>Hello World</h1>')
});
port.on('error', function (err) {
   console.log('Error: ', err.message);
})

//Arduino ////////////////////////////////////////////////////////////

parser.on('data', (data) => {
   console.log("data", data);
   io.emit('input', {"key": data});
});

// list serial ports:
SerialPort.list().then(
   ports => ports.forEach(port => console.log(port.path)), //COM3
   err => console.log(err)
)

server.listen(serverPort, () => {
   console.log('listening on', serverPort)
});
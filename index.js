//import { SerialPort } from './node_modules/serialport/dist/index.js'
//import { ReadlineParser } from './node_modules/@serialport/parser-readline/dist/index.js
import { SerialPort } from 'serialport'
import { ReadlineParser } from 'serialport'

import  express from 'express'//Express
import http from 'http'

const app = express();
const server = http.createServer(app);
const serverPort = 3000;

//Server /////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
   res.send('<h1>Hello World</h1>')
   var cum = gibData();
   res.send(`<h1>${cum}</h1>`)//hacer lo que haya hecho monk
});

server.listen(serverPort, () => {
   console.log('listening on', serverPort)
});

//Arduino ////////////////////////////////////////////////////////////
const protocolConfiguration = {
   path: 'COM4',
   baudRate: 9600
}
// list serial ports:
SerialPort.list().then (
   ports => ports.forEach(port =>console.log(port.path)),
   err => console.log(err)
)

const port = new SerialPort(protocolConfiguration);
const parser = port.pipe(new ReadlineParser());

function gibData(){
   parser.on('data', (data) => {
   console.log(data);
   return data;
});
}

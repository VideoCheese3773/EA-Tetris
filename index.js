import { SerialPort } from './node_modules/serialport/dist/index.js'
import { ReadlineParser } from './node_modules/@serialport/parser-readline/dist/index.js'

const protocolConfiguration = {
   path: 'COM3',
   baudRate: 9600
}
// list serial ports:
SerialPort.list().then (
    ports => ports.forEach(port =>console.log(port.path)),
    err => console.log(err)
 ) 
 
const port = new SerialPort(protocolConfiguration);
const parser = port.pipe(new ReadlineParser());

parser.on('data', (data) => {    
   console.log(data);
   return data;
});
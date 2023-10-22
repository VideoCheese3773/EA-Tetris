import { SerialPort } from 'serialport'
import { ReadlineParser } from 'serialport'

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

function getArduino(){
   parser.on('data', (data) => {    
      console.log(data);
      return data;
   });
}

export {getArduino};
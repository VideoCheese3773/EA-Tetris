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

parser.on('data', (data) => {    
   console.log(data);

   /*if( parseInt(data) % 5 == 0){
      parser.write("encender\n");
   } else {
      parser.write("apagar\n");
   }*/

   //parser.write("Orale\n");
});
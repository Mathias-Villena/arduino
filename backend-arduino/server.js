const { SerialPort, ReadlineParser } = require('serialport');
const WebSocket = require('ws');

const port = new SerialPort({ path: 'COM4', baudRate: 9600 });

// Crea un parser para leer línea por línea
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const mensaje = data.toString();
    port.write(mensaje + "\n");
    console.log("Enviado a Arduino:", mensaje);
  });

  // Lee línea completa del Arduino
  parser.on('data', (linea) => {
    console.log("Arduino dice:", linea);
    ws.send(linea);
  });
});

console.log("WebSocket server escuchando en ws://localhost:3001");




const WebSocket = require('ws');
// NO usamos serialport aquí porque no hay Arduino

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', function connection(ws) {
  console.log("Cliente conectado a WebSocket");

  ws.on('message', function incoming(message) {
    console.log('Simulando: recibido', message.toString());
    // Simula progreso
    let progress = 0;
    const interval = setInterval(() => {
      if (progress > 100) {
        ws.send("TERMINADO");
        clearInterval(interval);
      } else {
        ws.send(`PROGRESO:${progress}`);
        progress += 10;
      }
    }, 300);
  });
});

console.log("WebSocket server SIMULADO escuchando en ws://localhost:3001");

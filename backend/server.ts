import net, { Socket } from "net";
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { Multiplexer } from "./mux";

const metricsBus = new EventEmitter();

const tcpServer = net.createServer((socket: Socket) => {
  console.log("Client connected to TCP server.");

  const multiplexer = new Multiplexer(socket, metricsBus);

  socket.on("error", (err: Error) => {
    console.error("TCP Socket error:", err);
  });

  socket.on("close", () => {
    console.log("Client disconnected from TCP server.");
  });
});

tcpServer.listen(3000, "localhost", () => {
  console.log("TCP Server listening on port 3000");
});

const wss = new WebSocketServer({ port: 3000 }); 

wss.on('connection', ws => {
  console.log('WebSocket client connected');

  const sendMetric = (eventName: string, data: any) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: eventName, ...data }));
    }
  };

  const onStreamUpdate = (data: any) => sendMetric('streamUpdate', data);
  const onConnectionStats = (data: any) => sendMetric('connectionStats', data);

  metricsBus.on('streamUpdate', onStreamUpdate);
  metricsBus.on('connectionStats', onConnectionStats);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    metricsBus.off('streamUpdate', onStreamUpdate);
    metricsBus.off('connectionStats', onConnectionStats);
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

console.log("WebSocket Telemetry Bridge listening on port 3000");

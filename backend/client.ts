// import net from "net";
// import { FrameSockets } from "./frameSocket.js";

// const socket = net.connect(3000, "localhost");
// const frameParser = new FrameSockets();

// socket.on("data", (chunk) => {
//   const frames = frameParser.incomingBuffer(chunk);
//   for (const { payload } of frames) {
//     console.log("Server replied:", payload.toString());
//   }
// });

// const msg = Buffer.from("Hello, world!");
// const frame = FrameSockets.createFrame(1, msg);
// socket.write(frame);

import net, { Socket } from "net";
import { FrameSockets } from "./frameSocket";

const socket: Socket = net.connect(3000, "localhost", () => {
  console.log("Connected to server.");

  const msg = Buffer.from("Hello, world!");
  const frame = FrameSockets.createFrame(1, msg);
  socket.write(frame);
});

const frameParser = new FrameSockets();

socket.on("data", (chunk: Buffer) => {
  const frames = frameParser.incomingBuffer(chunk);
  for (const { streamId, payload } of frames) {
    console.log(`Server replied (stream ${streamId}):`, payload.toString());
  }
});

socket.on("error", (err: Error) => {
  console.error("Socket error:", err);
});

socket.on("close", () => {
  console.log("Connection closed by server.");
});

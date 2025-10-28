import net from "net";
import { FrameSockets } from "./frameSocket.js";

const socket = net.connect(3000, "localhost");
const frameParser = new FrameSockets();

socket.on("data", (chunk) => {
  const frames = frameParser.incomingBuffer(chunk);
  for (const { payload } of frames) {
    console.log("Server replied:", payload.toString());
  }
});

const msg = Buffer.from("Hello, world!");
const frame = FrameSockets.createFrame(1, msg);
socket.write(frame);

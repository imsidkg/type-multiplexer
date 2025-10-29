import net, { Socket } from "net";
import fs from "fs"; // Import the fs module
import { FrameSockets } from "./frameSocket";

const socket: Socket = net.connect(3000, "localhost", () => {
  console.log("Connected to server.");

  const msg = Buffer.from("Hello, world!");
  const textFrame = FrameSockets.createFrame(1, msg);
  socket.write(textFrame);
  console.log("Sent text message on stream 1.");

  const imagePath = './image.jpeg'; 
  fs.readFile(imagePath, (err, imageData) => {
    if (err) {
      console.error(`Error reading image file at ${imagePath}:`, err);
      socket.destroy();
      return;
    }
    
    console.log(`Sending image '${imagePath}' (${imageData.length} bytes) on stream 2.`);
    const imageFrame = FrameSockets.createFrame(2, imageData);
    socket.write(imageFrame);
  });
});

const frameParser = new FrameSockets();

socket.on("data", (chunk: Buffer) => {
  const frames = frameParser.incomingBuffer(chunk);
  for (const { streamId, payload } of frames) {
    
    if (streamId === 2) {
      console.log(`Received ACK for image on stream ${streamId}. Payload size: ${payload.length} bytes.`);
    } else {
      console.log(`Server replied (stream ${streamId}):`, payload.toString());
    }
  }
});

socket.on("error", (err: Error) => {
  console.error("Socket error:", err);
});

socket.on("close", () => {
  console.log("Connection closed by server.");
});
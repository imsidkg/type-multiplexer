import net from "net";
import { FrameSockets } from "./frameSocket";

const server = net.createServer((socket) => {
  socket.on("error", (dikkat) => {
    console.log(dikkat);
  });
  const frameParser = new FrameSockets();

  socket.on("data", (chunk) => {
    const frames = frameParser.incomingBuffer(chunk);
    for (const { streamId, payload } of frames) {
      console.log(`Recieved stream ${streamId} : ${payload}`);

      const response = FrameSockets.createFrame(
        streamId,
        Buffer.from("ACK: " + payload.toString())
      );
      socket.write(response);
    }
  });
  socket.on("error", (err) => console.error("Socket error:", err));
});

server.listen(3000, () => console.log("listening to port 3000"));

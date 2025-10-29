// import net from "net";
// import { FrameSockets } from "./frameSocket";

// const server = net.createServer((socket) => {
//   socket.on("error", (dikkat) => {
//     console.log(dikkat);
//   });
//   const frameParser = new FrameSockets();

//   socket.on("data", (chunk) => {
//     const frames = frameParser.incomingBuffer(chunk);
//     for (const { streamId, payload } of frames) {
//       console.log(`Recieved stream ${streamId} : ${payload}`);

//       const response = FrameSockets.createFrame(
//         streamId,
//         Buffer.from("ACK: " + payload.toString())
//       );
//       socket.write(response);
//     }
//   });
//   socket.on("error", (err) => console.error("Socket error:", err));
// });

// server.listen(3000, () => console.log("listening to port 3000"));

import net, { Socket } from "net";
import { FrameSockets } from "./frameSocket";

const server = net.createServer((socket: Socket) => {
  console.log("Client connected.");

  const frameParser = new FrameSockets();

  socket.on("error", (err: Error) => {
    console.error("Socket error:", err);
  });

  socket.on("data", (chunk: Buffer) => {
    const frames = frameParser.incomingBuffer(chunk);

    for (const { streamId, payload } of frames) {
      console.log(`Received stream ${streamId}: ${payload.toString()}`);

      const responsePayload = Buffer.from("ACK: " + payload.toString());
      const responseFrame = FrameSockets.createFrame(streamId, responsePayload);

      socket.write(responseFrame);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected.");
  });
});

server.listen(3000, "localhost", () => {
  console.log("Server listening on port 3000");
});

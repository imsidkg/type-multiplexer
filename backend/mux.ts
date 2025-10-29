import { EventEmitter } from "events";
import { FrameSockets } from "./frameSocket.js";
import type { Socket } from "net";

export interface Stream extends EventEmitter {
  send: (data: string | Buffer) => void;
}

export class Multiplexer {
  private socket: Socket;
  private frameParser: FrameSockets;
  private streams: Map<number, Stream>;

  constructor(socket: Socket) {
    this.socket = socket;
    this.frameParser = new FrameSockets();
    this.streams = new Map<number, Stream>();

    this.socket.on("data", (chunk: Buffer) => {
      const frames = this.frameParser.incomingBuffer(chunk);
      for (const { streamId, payload } of frames) {
        this.handleFrame(streamId, payload);
      }
    });
  }

  public createStream(streamId: number): Stream {
    const stream = new EventEmitter() as Stream;
    this.streams.set(streamId, stream);

    stream.send = (data: string | Buffer): void => {
      const payload = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const frame = FrameSockets.createFrame(streamId, payload);
      this.socket.write(frame);
    };

    return stream;      
  }

  private handleFrame(streamId: number, payload: Buffer): void {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.emit("data", payload);
    } else {
      console.warn(`No handler found for stream ${streamId}`);
    }
  }
}

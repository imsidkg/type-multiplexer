import { EventEmitter } from "events";
import { FrameSockets } from "./frameSocket.js";
import type { Socket } from "net";

export interface Stream extends EventEmitter {
  send: (data: string | Buffer) => void;
  streamId: number;
}

export class Multiplexer {
  private socket: Socket;
  private frameParser: FrameSockets;
  private streams: Map<number, Stream>;
  private metricsBus: EventEmitter;

  private totalBytesSent: number = 0;
  private totalBytesReceived: number = 0;
  private streamBytesSent: Map<number, number> = new Map();
  private streamBytesReceived: Map<number, number> = new Map();
  private lastActivity: Map<number, number> = new Map();

  constructor(socket: Socket, metricsBus: EventEmitter) {
    this.socket = socket;
    this.metricsBus = metricsBus;
    this.frameParser = new FrameSockets();
    this.streams = new Map<number, Stream>();

    this.socket.on("data", (chunk: Buffer) => {
      const frames = this.frameParser.incomingBuffer(chunk);
      for (const { streamId, payload } of frames) {
        this.handleFrame(streamId, payload);
      }
    });

    this.socket.on("close", () => {
      this.streams.forEach(stream => this.emitStreamUpdate(stream.streamId));
      this.emitConnectionStats();
    });

    this.socket.on("error", (err) => {
      console.error("Multiplexer socket error:", err);
    });
  }

  public createStream(streamId: number): Stream {
    if (this.streams.has(streamId)) {
      return this.streams.get(streamId)!;
    }

    const stream = new EventEmitter() as Stream;
    stream.streamId = streamId;
    this.streams.set(streamId, stream);

    this.streamBytesSent.set(streamId, 0);
    this.streamBytesReceived.set(streamId, 0);
    this.lastActivity.set(streamId, Date.now());

    stream.send = (data: string | Buffer): void => {
      const payload = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const frame = FrameSockets.createFrame(streamId, payload);
      this.socket.write(frame);

      this.totalBytesSent += payload.length;
      this.streamBytesSent.set(streamId, (this.streamBytesSent.get(streamId) || 0) + payload.length);
      this.lastActivity.set(streamId, Date.now());

      this.emitStreamUpdate(streamId);
      this.emitConnectionStats();
    };

    return stream;
  }

  private handleFrame(streamId: number, payload: Buffer): void {
    const stream = this.streams.get(streamId) || this.createStream(streamId);
    
    console.log(`Multiplexer received data for stream ${streamId}: ${payload.toString()} (${payload.length} bytes)`);
    stream.emit("data", payload);

    this.totalBytesReceived += payload.length;
    this.streamBytesReceived.set(streamId, (this.streamBytesReceived.get(streamId) || 0) + payload.length);
    this.lastActivity.set(streamId, Date.now());

    this.emitStreamUpdate(streamId);
    this.emitConnectionStats();

    stream.send(Buffer.from("ACK: " + payload.toString()));
  }

  private emitStreamUpdate(streamId: number): void {
    this.metricsBus.emit('streamUpdate', {
      type: 'streamUpdate',
      streamId: streamId.toString(),
      bytesSent: this.streamBytesSent.get(streamId) || 0,
      bytesReceived: this.streamBytesReceived.get(streamId) || 0,
      queueSize: 0, 
      lastActivity: this.lastActivity.get(streamId) || Date.now(),
    });
  }

  private emitConnectionStats(): void {
    const rtt = Math.floor(Math.random() * 200);

    this.metricsBus.emit('connectionStats', {
      type: 'connectionStats',
      activeStreams: this.streams.size,
      totalBytes: this.totalBytesSent + this.totalBytesReceived,
      rtt: rtt,
    });
  }
}

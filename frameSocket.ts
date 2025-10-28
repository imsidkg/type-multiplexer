import { resolve } from "bun";

export class FrameSockets {
  static HEADER_SIZE = 4;
  static STREAM_ID = 1;
  buffer = Buffer.alloc(0);

  incomingBuffer = async(chunk: Buffer): Promise<Buffer[]> => {
    const frame: Buffer[] = [];
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 5) {
      const length = this.buffer.readInt32BE(0);
      const frameLength = 4 + 1 + length;

      if (this.buffer.length < frameLength) break;

      const streamId = this.buffer.readUInt8(4);
      const payload = this.buffer.subarray(5, frameLength);

      frame.push(payload);
      this.buffer = this.buffer.subarray(frameLength);
    }
    return frame;
  };
}

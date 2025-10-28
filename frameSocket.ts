import { resolve } from "bun";

export class FrameSockets {
  static HEADER_SIZE = 4;
  static STREAM_ID = 1;
  buffer = Buffer.alloc(0);

  incomingBuffer =  (
    chunk: Buffer
  ): Array<{ streamId: number; payload: Buffer }> => {
    const frame: Array<{ streamId: number; payload: Buffer }> = [];
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 5) {
      const length = this.buffer.readInt32BE(0);
      const frameLength = 4 + 1 + length;

      if (this.buffer.length < frameLength) break;

      const streamId = this.buffer.readUInt8(4);
      const payload = this.buffer.subarray(5, frameLength);

      frame.push({ streamId, payload });
      this.buffer = this.buffer.subarray(frameLength);
    }
    return frame;
  };

  static createFrame = (streamId: number, payload: Buffer) => {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeInt32BE(payload.length);

    const idBuf = Buffer.from([streamId]);

    return Buffer.concat([lenBuf, idBuf, payload]);
  };
}

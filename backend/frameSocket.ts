export class FrameSockets {
  static FRAME_HEADERS = 4;
  static STREAM_ID = 1;

  buffer = Buffer.alloc(0);

  incomingBuffer = (chunk: Buffer) => {
    const frames: Array<{ payload: Buffer; streamId: number }> = [];
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= 5) {
      const length = this.buffer.readInt32BE(0);
      const frameLength = 4 + 1 + length;

      if (this.buffer.length < frameLength) break;
      const streamId = this.buffer.readUInt8(4);
      const payload = this.buffer.subarray(5, frameLength);

      frames.push({ streamId, payload });
      this.buffer = this.buffer.subarray(frameLength);
    }
    return frames;
  };

  static createFrame = (streamId: number,payload: Buffer) => {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeInt32BE(payload.length);

    const idBuf = Buffer.from([streamId]);

    return Buffer.concat([lenBuf, idBuf, payload]);
  };
}

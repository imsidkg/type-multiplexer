// Telemetry data types
export interface StreamUpdate {
  streamId: string;
  bytesSent: number;
  bytesReceived: number;
  queueSize: number;
  lastActivity: number;
}

export interface ConnectionStats {
  activeStreams: number;
  totalBytes: number;
  rtt: number;
}
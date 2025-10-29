import { useState, useEffect } from 'react';
import { StreamUpdate, ConnectionStats } from '../types/telemetry';

interface TelemetryState {
  streamUpdates: { [key: string]: StreamUpdate };
  connectionStats: ConnectionStats | null;
  isConnected: boolean;
}

const initialTelemetryState: TelemetryState = {
  streamUpdates: {},
  connectionStats: null,
  isConnected: false,
};

export const useTelemetry = (url: string) => {
  const [telemetry, setTelemetry] = useState<TelemetryState>(initialTelemetryState);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectInterval: ReturnType<typeof setInterval>;

    const connect = () => {
      ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setTelemetry((prev) => ({ ...prev, isConnected: true }));
        clearInterval(reconnectInterval);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'streamUpdate') {
          setTelemetry((prev) => ({
            ...prev,
            streamUpdates: {
              ...prev.streamUpdates,
              [message.streamId]: message,
            },
          }));
        } else if (message.type === 'connectionStats') {
          setTelemetry((prev) => ({
            ...prev,
            connectionStats: message,
          }));
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setTelemetry((prev) => ({ ...prev, isConnected: false }));
        reconnectInterval = setInterval(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    connect();

    return () => {
      clearInterval(reconnectInterval);
      ws.close();
    };
  }, [url]);

  return telemetry;
};

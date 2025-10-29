import React from 'react';
import { ConnectionStats as ConnectionStatsType } from '../types/telemetry';

interface ConnectionStatsProps {
  stats: ConnectionStatsType | null;
  isConnected: boolean;
}

const ConnectionStats: React.FC<ConnectionStatsProps> = ({ stats, isConnected }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">Connection Statistics</h2>
      {!isConnected && <p className="text-red-500">Disconnected. Attempting to reconnect...</p>}
      {stats ? (
        <div className="grid grid-cols-2 gap-2">
          <p><strong>Active Streams:</strong> {stats.activeStreams}</p>
          <p><strong>Total Bytes:</strong> {stats.totalBytes}</p>
          <p><strong>RTT:</strong> {stats.rtt} ms</p>
        </div>
      ) : (
        <p>No connection stats available.</p>
      )}
    </div>
  );
};

export default ConnectionStats;

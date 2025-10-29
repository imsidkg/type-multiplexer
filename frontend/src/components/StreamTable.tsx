import React from 'react';
import { StreamUpdate } from '../types/telemetry';

interface StreamTableProps {
  streamUpdates: { [key: string]: StreamUpdate };
}

const StreamTable: React.FC<StreamTableProps> = ({ streamUpdates }) => {
  const streams = Object.values(streamUpdates);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-2">Active Streams</h2>
      {streams.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bytes Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bytes Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queue Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {streams.map((stream) => (
                <tr key={stream.streamId}>
                  <td className="px-6 py-4 whitespace-nowrap">{stream.streamId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stream.bytesSent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stream.bytesReceived}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stream.queueSize}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(stream.lastActivity).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No active streams.</p>
      )}
    </div>
  );
};

export default StreamTable;

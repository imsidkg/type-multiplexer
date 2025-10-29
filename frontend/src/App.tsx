import React from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import ConnectionStats from './components/ConnectionStats';
import StreamTable from './components/StreamTable';

function App() {
  const { streamUpdates, connectionStats, isConnected } = useTelemetry('ws://localhost:3000');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Telemetry Dashboard</h1>
      <div className="container mx-auto">
        <ConnectionStats stats={connectionStats} isConnected={isConnected} />
        <StreamTable streamUpdates={streamUpdates} />
      </div>
    </div>
  );
}

export default App;
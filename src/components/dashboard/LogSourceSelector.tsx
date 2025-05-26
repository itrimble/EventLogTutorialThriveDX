'use client';

import React, { useState } from 'react';
import LogSourceStatus from './LogSourceStatus'; // Will create this next

type LogSource = 'Windows' | 'Linux' | 'macOS';
type Status = 'Connected' | 'Not Connected' | 'Error';

interface LogSourceInfo {
  name: LogSource;
  status: Status;
  // Placeholder for potential future icons
  // icon?: JSX.Element; 
}

const logSources: LogSourceInfo[] = [
  { name: 'Windows', status: 'Connected' },
  { name: 'Linux', status: 'Not Connected' },
  { name: 'macOS', status: 'Error' },
];

const StatusIndicator: React.FC<{ status: Status }> = ({ status }) => {
  let bgColor = 'bg-gray-500'; // Default: Not Connected
  let textColor = 'text-gray-200';
  if (status === 'Connected') {
    bgColor = 'bg-green-500';
    textColor = 'text-green-100';
  } else if (status === 'Error') {
    bgColor = 'bg-red-500';
    textColor = 'text-red-100';
  }
  return (
    <span className={`w-3 h-3 ${bgColor} rounded-full inline-block mr-2`} title={status}></span>
  );
};

const LogSourceSelector: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<LogSource>('Windows');

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex border-b border-gray-700 mb-4">
        {logSources.map((source) => (
          <button
            key={source.name}
            onClick={() => setSelectedSource(source.name)}
            className={`py-2 px-4 -mb-px text-sm font-medium focus:outline-none flex items-center
                        ${
                          selectedSource === source.name
                            ? 'border-blue-500 border-b-2 text-blue-400'
                            : 'border-transparent hover:border-gray-600 hover:text-gray-300 text-gray-400'
                        }`}
          >
            <StatusIndicator status={source.status} />
            {source.name}
          </button>
        ))}
      </div>
      <div>
        {/* LogSourceStatus will display details for the selectedSource */}
        <LogSourceStatus sourceName={selectedSource} />
      </div>
    </div>
  );
};

export default LogSourceSelector;

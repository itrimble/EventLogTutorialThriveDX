'use client';

import React from 'react';

type LogSource = 'Windows' | 'Linux' | 'macOS';

interface LogSourceStatusProps {
  sourceName: LogSource;
}

interface StatusDetails {
  status: 'Connected' | 'Not Connected' | 'Error';
  lastSynced: string;
  eventsIngested: number;
  errors: number;
}

const mockStatusData: Record<LogSource, StatusDetails> = {
  Windows: {
    status: 'Connected',
    lastSynced: '2023-10-27 10:00:00 UTC',
    eventsIngested: 1500,
    errors: 0,
  },
  Linux: {
    status: 'Not Connected',
    lastSynced: '2023-10-26 12:00:00 UTC',
    eventsIngested: 0,
    errors: 5,
  },
  macOS: {
    status: 'Error',
    lastSynced: '2023-10-27 09:30:00 UTC',
    eventsIngested: 50,
    errors: 12,
  },
};

const LogSourceStatus: React.FC<LogSourceStatusProps> = ({ sourceName }) => {
  const details = mockStatusData[sourceName];

  let statusColorClass = 'text-gray-400';
  if (details.status === 'Connected') {
    statusColorClass = 'text-green-400';
  } else if (details.status === 'Error') {
    statusColorClass = 'text-red-400';
  }

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-lg">
      <h4 className="text-md font-semibold text-gray-200 mb-3">
        Status for: <span className="font-bold">{sourceName}</span>
      </h4>
      <ul className="space-y-2 text-sm">
        <li>
          Status:{' '}
          <span className={`font-semibold ${statusColorClass}`}>
            {details.status}
          </span>
        </li>
        <li>Last Synced: <span className="text-gray-300">{details.lastSynced}</span></li>
        <li>Events Ingested: <span className="text-gray-300">{details.eventsIngested.toLocaleString()}</span></li>
        <li>Errors: <span className={details.errors > 0 ? 'text-red-400' : 'text-green-400'}>{details.errors}</span></li>
      </ul>
    </div>
  );
};

export default LogSourceStatus;

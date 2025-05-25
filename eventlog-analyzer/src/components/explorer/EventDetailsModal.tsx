'use client';

import React from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  event_id: string;
  hostname: string;
  user: string;
  source_ip: string;
  log_level: string;
  description: string;
  full_data: object | string;
  mitre_attack_mapping?: string;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logEntry: LogEntry | null; 
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, logEntry }) => {
  if (!isOpen || !logEntry) {
    return null;
  }

  const handlePivot = (pivotType: string, value: string) => {
    console.log(`Pivoting on ${pivotType}: ${value}`);
    // In a real application, this would trigger a new search/filter action
    onClose(); // Close modal after pivot action for this mock
  };

  const renderFullData = (data: object | string) => {
    if (typeof data === 'string') {
      return <pre className="whitespace-pre-wrap text-xs bg-gray-900 p-3 rounded-md">{data}</pre>;
    }
    try {
      return <pre className="whitespace-pre-wrap text-xs bg-gray-900 p-3 rounded-md">{JSON.stringify(data, null, 2)}</pre>;
    } catch (error) {
      return <p className="text-xs text-red-400">Error displaying full data.</p>;
    }
  };
  
  const getLogLevelClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-400';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-400';
      case 'information': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl max-w-3xl w-full text-gray-100 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeInScale">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
          <h2 className="text-lg md:text-xl font-semibold">Log Entry Details (ID: {logEntry.id})</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors text-2xl p-1"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div><span className="font-semibold text-gray-400">Timestamp:</span> <span className="text-gray-200">{logEntry.timestamp}</span></div>
            <div><span className="font-semibold text-gray-400">Event ID:</span> <span className="text-gray-200">{logEntry.event_id}</span></div>
            <div><span className="font-semibold text-gray-400">Hostname:</span> <span className="text-gray-200">{logEntry.hostname}</span></div>
            <div><span className="font-semibold text-gray-400">User:</span> <span className="text-gray-200">{logEntry.user}</span></div>
            <div><span className="font-semibold text-gray-400">Source IP:</span> <span className="text-gray-200">{logEntry.source_ip}</span></div>
            <div><span className="font-semibold text-gray-400">Log Level:</span> <span className={getLogLevelClass(logEntry.log_level)}>{logEntry.log_level}</span></div>
          </div>

          <div className="pt-1">
            <p className="font-semibold text-gray-400">Description:</p>
            <p className="text-gray-200 whitespace-pre-wrap bg-gray-750 p-2 rounded-md">{logEntry.description}</p>
          </div>

          {logEntry.mitre_attack_mapping && (
            <div className="pt-1">
              <p className="font-semibold text-gray-400">MITRE ATT&CK Mapping:</p>
              <p className="text-gray-200">{logEntry.mitre_attack_mapping}</p>
            </div>
          )}
          
          <div className="pt-1">
            <p className="font-semibold text-gray-400 mb-1">Full Data:</p>
            {renderFullData(logEntry.full_data)}
          </div>

          <div className="pt-3 mt-3 border-t border-gray-700">
            <p className="font-semibold text-gray-400 mb-2">Pivot Actions:</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handlePivot('User', logEntry.user)}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                Find logs from User: {logEntry.user}
              </button>
              <button 
                onClick={() => handlePivot('Hostname', logEntry.hostname)}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                Find logs from Host: {logEntry.hostname}
              </button>
              <button 
                onClick={() => handlePivot('Event ID', logEntry.event_id)}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                Find logs with Event ID: {logEntry.event_id}
              </button>
               {logEntry.source_ip && logEntry.source_ip !== "N/A" && (
                 <button 
                    onClick={() => handlePivot('Source IP', logEntry.source_ip)}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                  >
                    Find logs from IP: {logEntry.source_ip}
                  </button>
               )}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 flex justify-end border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes modalFadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalFadeInScale {
          animation: modalFadeInScale 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* bg-gray-700 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563; /* bg-gray-600 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #556372; /* darker shade */
        }
        .bg-gray-750 { background-color: #3f4b5a; } /* Custom shade between gray-700 and gray-800 */
      `}</style>
    </div>
  );
};

export default EventDetailsModal;

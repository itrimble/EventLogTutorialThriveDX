"use client";

import React, { useState, useMemo } from 'react';
import logEntryData from '@/lib/data/mock_log_entries.json'; 
import EventDetailsModal from './EventDetailsModal'; 

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

const ITEMS_PER_PAGE = 10; // Adjusted for potentially longer log entry rows

type SortKey = keyof Pick<LogEntry, 'timestamp' | 'event_id' | 'hostname' | 'user' | 'log_level'>;
type SortOrder = 'asc' | 'desc';

const EventsTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const rawData: LogEntry[] = useMemo(() => logEntryData as LogEntry[], []);

  const sortedData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (a[sortKey] > b[sortKey]) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [rawData, sortKey, sortOrder]);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return sortedData;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return sortedData.filter(log => 
      log.event_id.toLowerCase().includes(lowerSearchTerm) ||
      log.description.toLowerCase().includes(lowerSearchTerm) ||
      log.user.toLowerCase().includes(lowerSearchTerm) ||
      log.hostname.toLowerCase().includes(lowerSearchTerm) ||
      (log.source_ip && log.source_ip.toLowerCase().includes(lowerSearchTerm)) ||
      log.log_level.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, sortedData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); 
  };

  const handleRowClick = (log: LogEntry) => {
    setSelectedEvent(log);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortKey === key) {
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };
  
  const getLogLevelClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-700 text-red-100';
      case 'error': return 'bg-red-500 text-red-100';
      case 'warning': return 'bg-yellow-500 text-yellow-100';
      case 'information': return 'bg-blue-500 text-blue-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };


  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Event Log Entries</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search logs (Event ID, User, Hostname, Description, IP, Level)..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 rounded-md bg-gray-700 text-gray-200 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              {[
                { label: 'Timestamp', key: 'timestamp' as SortKey },
                { label: 'Event ID', key: 'event_id' as SortKey },
                { label: 'Hostname', key: 'hostname' as SortKey },
                { label: 'User', key: 'user' as SortKey },
                { label: 'Source IP', key: null }, // Not sorting IP for simplicity now
                { label: 'Description', key: null }, // Not sorting description
                { label: 'Log Level', key: 'log_level' as SortKey },
              ].map(col => (
                <th 
                  key={col.label} 
                  scope="col" 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                  onClick={() => col.key && handleSort(col.key)}
                >
                  {col.label}
                  {col.key && getSortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {paginatedData.map((log) => (
              <tr 
                key={log.id}
                className="hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                onClick={() => handleRowClick(log)}
              >
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">{log.timestamp}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{log.event_id}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">{log.hostname}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">{log.user}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">{log.source_ip}</td>
                <td className="px-3 py-3 text-sm text-gray-300 max-w-sm truncate" title={log.description}>{log.description}</td>
                <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getLogLevelClass(log.log_level)}`}>
                        {log.log_level}
                    </span>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-3 text-center text-sm text-gray-400">No log entries found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && selectedEvent && (
        <EventDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          logEntry={selectedEvent} // Prop name changed to logEntry
        />
      )}
    </div>
  );
};

export default EventsTable;

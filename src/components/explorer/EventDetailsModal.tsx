'use client';

import React, { useState, useEffect } from 'react';
import type { LogEntry } from '@/lib/types/log_entry';
import { searchBrave, type BraveSearchResultItem } from '@/lib/brave_search';
import { AlertTriangle, Search, ExternalLink, Info } from 'lucide-react';


interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logEntry: LogEntry | null; 
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, logEntry }) => {
  const [braveSearchResults, setBraveSearchResults] = useState<BraveSearchResultItem[]>([]);
  const [isBraveSearchLoading, setIsBraveSearchLoading] = useState<boolean>(false);
  const [braveSearchError, setBraveSearchError] = useState<string | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string | null>(null);

  // Effect to reset Brave Search state when modal is closed or log entry changes
  useEffect(() => {
    if (!isOpen) {
      setBraveSearchResults([]);
      setIsBraveSearchLoading(false);
      setBraveSearchError(null);
      setCurrentSearchTerm(null);
    } else {
      // Optionally, reset when logEntry changes if modal stays open for different entries
      setBraveSearchResults([]);
      setIsBraveSearchLoading(false);
      setBraveSearchError(null);
      setCurrentSearchTerm(null);
    }
  }, [isOpen, logEntry]);


  if (!isOpen || !logEntry) {
    return null;
  }

  const handlePivot = (pivotType: string, value: string) => {
    console.log(`Pivoting on ${pivotType}: ${value}. Note: Actual pivot search not implemented in this version.`);
    // In a real application, this would trigger a new search/filter action
  };

  const handleBraveSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setBraveSearchError("Search term cannot be empty.");
      return;
    }
    setIsBraveSearchLoading(true);
    setBraveSearchError(null);
    setBraveSearchResults([]);
    setCurrentSearchTerm(searchTerm);

    try {
      const results = await searchBrave(searchTerm);
      if (results.length === 0 && !process.env.BRAVE_API_KEY) {
         setBraveSearchError('Brave API key is not configured. Search is unavailable.');
      } else if (results.length === 0 ) {
        // This case might also occur if API key is invalid or other API errors
        // searchBrave currently returns [] on API errors, so we check for this.
        // A more robust error handling in searchBrave itself could differentiate.
        const key = await process.env.BRAVE_API_KEY; // Check again, in case it was set late
        if(!key) {
             setBraveSearchError('Brave API key is missing. Search is unavailable.');
        } else {
            // If key exists, but no results, it could be a genuine no results or an API issue not caught as specific error.
            // The mock API returns results, so this state is less likely with mock.
            // For a real API, if searchBrave returns [] due to an API error (like 401), this message will show.
             setBraveSearchError(`No results found for "${searchTerm}". This might also indicate an API issue if a key is set.`);
        }
      }
      setBraveSearchResults(results);
    } catch (error: any) {
      console.error('Brave Search failed:', error);
      setBraveSearchError(error.message || 'An unexpected error occurred during Brave Search.');
    } finally {
      setIsBraveSearchLoading(false);
    }
  };

  const renderEnrichedData = (data: any) => {
    if (!data || Object.keys(data).length === 0) return <p className="text-xs text-gray-500">No enriched data available.</p>;
    if (typeof data === 'string') {
      return <pre className="whitespace-pre-wrap text-xs bg-gray-900 p-3 rounded-md">{data}</pre>;
    }
    try {
      return <pre className="whitespace-pre-wrap text-xs bg-gray-900 p-3 rounded-md">{JSON.stringify(data, null, 2)}</pre>;
    } catch (error) {
      console.error("Error rendering enriched_data:", error);
      return <p className="text-xs text-red-400">Error displaying enriched data.</p>;
    }
  };
  
  const SearchButton: React.FC<{ term: string; displayTerm?: string }> = ({ term, displayTerm }) => (
    <button
      onClick={() => handleBraveSearch(term)}
      title={`Search "${term}" with Brave`}
      className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors
                 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-blue-500
                 inline-flex items-center"
      disabled={isBraveSearchLoading && currentSearchTerm === term}
    >
      <Search size={12} className="mr-1" />
      {isBraveSearchLoading && currentSearchTerm === term ? 'Searching...' : (displayTerm || term)}
    </button>
  );

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
        
        <div className="space-y-3 text-sm max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Log Entry Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-3">
            <div>
              <span className="font-semibold text-gray-400">Timestamp:</span> 
              <span className="text-gray-200 ml-1">{new Date(logEntry.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-400">Source Identifier:</span> 
              <span className="text-gray-200 ml-1">{logEntry.source_identifier}</span>
              <SearchButton term={logEntry.source_identifier} />
            </div>
            <div>
              <span className="font-semibold text-gray-400">Log File:</span> 
              <span className="text-gray-200 ml-1">{logEntry.log_file}</span>
              <SearchButton term={logEntry.log_file} />
            </div>
          </div>

          <div className="pt-1">
            <p className="font-semibold text-gray-400">Message:</p>
            <p className="text-gray-200 whitespace-pre-wrap bg-gray-750 p-2 rounded-md text-xs">
              {logEntry.message}
              <SearchButton term={logEntry.message.length > 100 ? logEntry.message.substring(0,100) + "..." : logEntry.message} displayTerm="Search Message (first 100 chars)" />
            </p>
          </div>
          
          <div className="pt-1">
            <h5 className="font-semibold text-gray-400 mb-1">Enriched Data:</h5>
            {renderEnrichedData(logEntry.enriched_data)}
          </div>

          {/* Pivot Actions - Kept for context, can be removed if not needed */}
          <div className="pt-3 mt-3 border-t border-gray-700">
            <h5 className="font-semibold text-gray-400 mb-2">Pivot Actions (Internal):</h5>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handlePivot('source_identifier', logEntry.source_identifier)}
                className="px-3 py-1 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-teal-500"
              >
                Internal Search: Source {logEntry.source_identifier}
              </button>
              {/* Add more pivot buttons as needed */}
            </div>
          </div>

          {/* Brave Search Section */}
          <div className="pt-3 mt-3 border-t border-gray-700">
            <h5 className="font-semibold text-gray-400 mb-2">
              Brave Search Results {currentSearchTerm ? `for "${currentSearchTerm}"` : ''}
            </h5>
            {isBraveSearchLoading && (
              <div className="flex items-center justify-center p-3 text-gray-400">
                <Search size={18} className="animate-pulse mr-2" /> Loading search results...
              </div>
            )}
            {braveSearchError && (
              <div className="p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-md flex items-center">
                <AlertTriangle size={18} className="mr-2 text-red-400" /> {braveSearchError}
              </div>
            )}
            {!isBraveSearchLoading && !braveSearchError && braveSearchResults.length === 0 && currentSearchTerm && (
              <div className="p-3 text-gray-400 flex items-center">
                 <Info size={18} className="mr-2" /> No results found for "{currentSearchTerm}".
              </div>
            )}
            {!isBraveSearchLoading && !braveSearchError && braveSearchResults.length > 0 && (
              <ul className="space-y-2 text-xs">
                {braveSearchResults.map((result, index) => (
                  <li key={index} className="p-2 bg-gray-750 rounded-md hover:bg-gray-700">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center"
                    >
                      {result.title} <ExternalLink size={12} className="ml-1" />
                    </a>
                    <p className="text-gray-300 text-xs mt-0.5">{result.description}</p>
                    {result.meta_url?.favicon && (
                        <img src={result.meta_url.favicon} alt="" className="w-3 h-3 inline-block mr-1 mt-1" />
                    )}
                    <span className="text-gray-500 text-xs">{result.meta_url?.netloc || new URL(result.url).hostname}</span>
                    {result.page_age && <span className="text-gray-500 text-xs ml-2"> (Aged: {new Date(result.page_age).toLocaleDateString()})</span>}
                  </li>
                ))}
              </ul>
            )}
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

// src/components/explorer/GenericResultsTable.tsx
'use client';

import React from 'react';

interface GenericResultsTableProps {
  data: any[];
}

const GenericResultsTable: React.FC<GenericResultsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    // This case is primarily handled by the parent component (page.tsx)
    // which shows "No results found..." or other relevant messages.
    // Returning null here as the parent component controls messages.
    return null;
  }

  // Extract column headers from the keys of the first object
  // Assumes all objects in the array have a similar structure (common for API list results)
  const headers = Object.keys(data[0] || {});

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900 sticky top-0"> {/* Made thead sticky */}
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                {header.replace(/_/g, ' ')} {/* Replace underscores for readability */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-600 transition-colors duration-150"> {/* Using bg-gray-600 for hover */}
              {headers.map((header) => {
                const cellData = row[header];
                let displayData;
                if (typeof cellData === 'object' && cellData !== null) {
                  displayData = JSON.stringify(cellData);
                } else if (cellData === null || cellData === undefined) {
                  displayData = 'N/A';
                } else {
                  displayData = String(cellData);
                }
                return (
                  <td
                    key={`${rowIndex}-${header}`}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-200 max-w-xs truncate"
                    title={typeof cellData === 'object' || typeof cellData === 'undefined' || cellData === null ? displayData : String(cellData)} // Show stringified or 'N/A' for objects/null/undefined, or full string for primitives
                  >
                    {displayData}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericResultsTable;

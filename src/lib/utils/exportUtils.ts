// src/lib/utils/exportUtils.ts

import type { LogEntry } from '@/lib/types/log_entry';

// Helper function to generate filename
export const generateFilename = (extension: string): string => {
  const date = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  // Format: YYYY-MM-DD_HH-MM-SS
  const timestamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  return `siem_logs_${timestamp}.${extension}`;
};

// Helper function to escape CSV values
export const escapeCsvValue = (value: any): string => {
  if (value == null) return ''; // Handle null or undefined
  const stringValue = String(value);
  // If value contains comma, newline, or double quote, enclose in double quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Double up existing double quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Common Download Trigger Function - This function interacts with the DOM (document, URL.createObjectURL)
// and is thus not a "pure" function in the strictest sense.
// While its internal logic is straightforward, testing it in a Node.js/Jest environment
// without a browser DOM can be tricky or require mocking browser APIs.
// For this exercise, we'll focus on testing the pure utility functions above.
export const triggerDownload = (content: string, filename: string, contentType: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Basic guard for non-browser environments
    console.warn('triggerDownload cannot be executed in a non-browser environment.');
    return;
  }
  const blob = new Blob([content], { type: contentType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // Clean up
};


// CSV Export Function - Relies on escapeCsvValue and triggerDownload
export const exportToCsv = (logs: LogEntry[], filename: string) => {
  if (logs.length === 0) return;

  const headers = ['ID', 'Timestamp', 'Source Identifier', 'Log File', 'Message', 'Enriched Data'];
  const csvRows = [
    headers.join(','), // Header row
    ...logs.map(log => 
      [
        escapeCsvValue(log.id),
        escapeCsvValue(log.timestamp),
        escapeCsvValue(log.source_identifier),
        escapeCsvValue(log.log_file),
        escapeCsvValue(log.message),
        escapeCsvValue(log.enriched_data ? JSON.stringify(log.enriched_data) : ''),
      ].join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  triggerDownload(csvString, filename, 'text/csv;charset=utf-8;');
};

// JSON Export Function - Relies on triggerDownload
export const exportToJson = (logs: LogEntry[], filename: string) => {
  if (logs.length === 0) return;

  const jsonString = JSON.stringify(logs, null, 2); // Pretty print with 2 spaces
  triggerDownload(jsonString, filename, 'application/json;charset=utf-8;');
};

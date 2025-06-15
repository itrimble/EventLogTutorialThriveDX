'use client';

import { useState } from 'react';
import { EventSearch } from '@/components/EventSearch';
import { SIEMQueryGenerator } from '@/components/SIEMQueryGenerator';
import { EventMapping } from '@/data/eventMappings';

export default function SearchPage() {
  const [selectedEvents, setSelectedEvents] = useState<EventMapping[]>([]);

  const handleEventSelect = (event: EventMapping) => {
    setSelectedEvents((prevSelectedEvents) => {
      const isAlreadySelected = prevSelectedEvents.some(
        (selectedEvent) => selectedEvent.eventId === event.eventId
      );
      if (isAlreadySelected) {
        return prevSelectedEvents.filter(
          (selectedEvent) => selectedEvent.eventId !== event.eventId
        );
      } else {
        return [...prevSelectedEvents, event];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedEvents([]);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="text-center py-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Event ID Search & SIEM Query Generation
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-300 mt-2">
          Use the tools below to find relevant Windows Event IDs and generate queries for your SIEM.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <section className="space-y-4 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">
            1. Find Event IDs
          </h2>
          <EventSearch
            onEventSelect={handleEventSelect}
            selectedEvents={selectedEvents}
          />
        </section>

        <section className="space-y-4 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">
            2. Generate SIEM Query
          </h2>
          <SIEMQueryGenerator
            selectedEvents={selectedEvents}
            onClearSelection={handleClearSelection}
          />
        </section>
      </div>
    </div>
  );
}

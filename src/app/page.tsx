<<<<<<< HEAD
'use client'

import { useState } from 'react'
import { EventMapping } from '@/data/eventMappings'
import { EventSearch } from '@/components/EventSearch'
import { SIEMQueryGenerator } from '@/components/SIEMQueryGenerator'
import { Shield, Database, Search, Code } from 'lucide-react'

export default function Home() {
  const [selectedEvents, setSelectedEvents] = useState<EventMapping[]>([])

  const handleEventSelect = (event: EventMapping) => {
    setSelectedEvents(prev => {
      const isAlreadySelected = prev.some(selected => selected.eventId === event.eventId)
      
      if (isAlreadySelected) {
        return prev.filter(selected => selected.eventId !== event.eventId)
      } else {
        return [...prev, event]
      }
    })
  }

  const handleClearSelection = () => {
    setSelectedEvents([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Shield className="text-blue-600" size={32} />
                <h1 className="text-2xl font-bold text-gray-900">
                  EventLog Tutorial
                </h1>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                ThriveDX
              </span>
            </div>
            
            <nav className="flex items-center space-x-6 text-sm">
              <a 
                href="#search" 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Search size={16} />
                <span>Search Events</span>
              </a>
              <a 
                href="#generator" 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Code size={16} />
                <span>Query Generator</span>
              </a>
              <a 
                href="https://attack.mitre.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Database size={16} />
                <span>MITRE ATT&amp;CK</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Windows Event Log Analysis &amp; SIEM Query Generation
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Learn cybersecurity monitoring by exploring Windows Event IDs mapped to MITRE ATT&amp;CK 
            techniques and generating targeted SIEM queries for Splunk, Sentinel, ELK, and Logstash.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <Search className="mx-auto mb-2" size={32} />
              <h3 className="font-semibold mb-1">Search Event IDs</h3>
              <p className="text-sm text-blue-100">Find relevant events by attack type</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-2" size={32} />
              <h3 className="font-semibold mb-1">MITRE Mapping</h3>
              <p className="text-sm text-blue-100">ATT&amp;CK technique correlation</p>
            </div>
            <div className="text-center">
              <Code className="mx-auto mb-2" size={32} />
              <h3 className="font-semibold mb-1">Query Generation</h3>
              <p className="text-sm text-blue-100">Multi-platform SIEM queries</p>
            </div>
            <div className="text-center">
              <Database className="mx-auto mb-2" size={32} />
              <h3 className="font-semibold mb-1">Real-time Learning</h3>
              <p className="text-sm text-blue-100">Hands-on cybersecurity education</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Search Section */}
          <div id="search" className="lg:col-span-2 space-y-6">
            <EventSearch 
              onEventSelect={handleEventSelect}
              selectedEvents={selectedEvents}
            />
          </div>

          {/* SIEM Query Generator Section */}
          <div id="generator" className="lg:col-span-1">
            <div className="sticky top-8">
              <SIEMQueryGenerator 
                selectedEvents={selectedEvents}
                onClearSelection={handleClearSelection}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Educational Resources Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Educational Resources
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhance your cybersecurity knowledge with these essential resources for Windows event log analysis and threat detection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Windows Event Documentation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Official Microsoft documentation on Windows Event IDs and security audit events.
              </p>
              <a
                href="https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/basic-security-audit-events"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Documentation →
              </a>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">MITRE ATT&amp;CK Framework</h3>
              <p className="text-gray-600 text-sm mb-4">
                Comprehensive knowledge base of adversary tactics, techniques, and procedures.
              </p>
              <a
                href="https://attack.mitre.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Explore Framework →
              </a>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">SIEM Query References</h3>
              <p className="text-gray-600 text-sm mb-4">
                Platform-specific documentation for Splunk, Sentinel, ELK, and Logstash query languages.
              </p>
              <div className="space-y-1">
                <a
                  href="https://docs.splunk.com/Documentation/Splunk/latest/SearchTutorial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Splunk Search →
                </a>
                <a
                  href="https://learn.microsoft.com/en-us/azure/sentinel/queries"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  Sentinel KQL →
                </a>
                <a
                  href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  ELK DSL →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield size={24} />
              <span className="font-semibold">EventLog Tutorial ThriveDX</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Built for cybersecurity education</span>
              <a
                href="mailto:itrimble@gmail.com"
                className="hover:text-white transition-colors"
              >
                Contact: itrimble@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
=======
import React from 'react';
import TotalEventsWidget from '@/components/dashboard/TotalEventsWidget';
import CriticalAlertsWidget from '@/components/dashboard/CriticalAlertsWidget';
import RecentLogSourcesWidget from '@/components/dashboard/RecentLogSourcesWidget'; 
import SystemHealthWidget from '@/components/dashboard/SystemHealthWidget';
import LogSourceSelector from '@/components/dashboard/LogSourceSelector';
import ActiveLogSourcesWidget from '@/components/dashboard/ActiveLogSourcesWidget';

const DashboardPage: React.FC = () => {
  const topEventIdsContent = (
    <ul className="space-y-1">
      <li>4625 (Failed Logon): <span className="font-semibold">102</span></li>
      <li>4688 (Process Create): <span className="font-semibold">85</span></li>
      <li>1102 (Log Cleared): <span className="font-semibold">5</span></li>
    </ul>
  );

  const recentDetectionsContent = (
    <ul className="space-y-1 list-disc list-inside">
      <li>Logon from unusual IP (192.168.1.100)</li>
      <li>Attempt to clear audit log (DC01)</li>
      <li>Potential malware: suspicious.exe (WKSTN03)</li>
    </ul>
  );

  return (
    <div className="space-y-8 p-4 md:p-6"> {/* Added padding to the main container */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-100 mb-6">Main Dashboard</h1>

      {/* Overview Widgets Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TotalEventsWidget /> {/* Mock value: "15,789" from its own definition */}
        <CriticalAlertsWidget /> {/* Mock value: "23" from its own definition */}
        <ActiveLogSourcesWidget count="3/3" /> {/* Using the new specific widget */}
        <SystemHealthWidget /> {/* Mock value: "Normal" from its own definition */}
      </div>

      {/* Log Source Selector - Assuming it's best placed after overview and before more detailed cards */}
      <div className="mb-8">
        <LogSourceSelector />
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">High-Severity Events Today</h3>
          <p className="text-gray-300">5 new, 2 unresolved</p>
        </div>
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Top Event IDs (Last 24h)</h3>
          <div className="text-gray-300">{topEventIdsContent}</div>
        </div>
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Active Hosts Reporting</h3>
          <p className="text-gray-300">17 hosts</p>
        </div>
        <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Recent Detections</h3>
          <div className="text-gray-300">{recentDetectionsContent}</div>
        </div>
      </div>
      
      {/* Existing placeholders - can be kept or removed based on overall dashboard design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <RecentLogSourcesWidget /> {/* This lists sources, distinct from active count */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-100 mb-3">Event Trends (Placeholder)</h3>
          <p className="text-gray-300">Chart or detailed information will be here.</p>
          <div className="mt-4 h-48 bg-gray-600 rounded flex items-center justify-center">
            <p className="text-gray-400">Chart Placeholder</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-700 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">Activity Log (Placeholder)</h3>
        <ul className="space-y-2 text-gray-300">
          <li>User JohnDoe accessed Dashboard - 1 min ago</li>
          <li>System alert triggered: High CPU usage on Server01 - 5 mins ago</li>
          <li>New log source &apos;Firewall-East&apos; added - 15 mins ago</li>
          <li>User JaneSmith ran analysis report &apos;Security_Anomalies_Q2&apos; - 1 hour ago</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
>>>>>>> add-claude-github-actions-1748383502583

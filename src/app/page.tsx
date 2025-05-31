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
'use client'

import { useState } from 'react'
import { Search, AlertTriangle, Shield, Database } from 'lucide-react'
import { searchEventsByAttackType, searchEventsByMitreTechnique, EventMapping } from '@/data/eventMappings'
import { EventCard } from './EventCard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button' // Import ShadCN Button
import { Input } from '@/components/ui/input'   // Import ShadCN Input

interface EventSearchProps {
  onEventSelect?: (event: EventMapping) => void
  selectedEvents?: EventMapping[]
}

export function EventSearch({ onEventSelect, selectedEvents = [] }: EventSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'attack' | 'technique'>('attack')
  const [results, setResults] = useState<EventMapping[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    
    // Simulate API delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let searchResults: EventMapping[] = []
    
    if (searchType === 'attack') {
      searchResults = searchEventsByAttackType(searchTerm)
    } else {
      searchResults = searchEventsByMitreTechnique(searchTerm)
    }
    
    setResults(searchResults)
    setIsSearching(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const isEventSelected = (event: EventMapping) => {
    return selectedEvents.some(selected => selected.eventId === event.eventId)
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Event ID Search</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Search for Windows Event IDs by attack type or MITRE ATT&amp;CK technique to build targeted SIEM queries
        </p>
      </div>

      {/* Search Controls */}
      <div className="space-y-4">
        {/* Search Type Selector */}
        <div className="flex justify-center space-x-4">
          <Button
            variant={searchType === 'attack' ? 'default' : 'outline'}
            onClick={() => setSearchType('attack')}
            className="flex items-center space-x-2"
          >
            <AlertTriangle size={16} />
            <span>Attack Type</span>
          </Button>
          <Button
            variant={searchType === 'technique' ? 'default' : 'outline'}
            onClick={() => setSearchType('technique')}
            className="flex items-center space-x-2"
          >
            <Shield size={16} />
            <span>MITRE Technique</span>
          </Button>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto relative flex items-center">
          <Search className="absolute left-3 text-gray-400" size={20} />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              searchType === 'attack'
                ? "e.g., privilege escalation, lateral movement, credential access..."
                : "e.g., T1078, T1021, T1003..."
            }
            className="w-full pl-10 pr-[calc(theme(spacing.4)_+_theme(spacing.10))]" // Adjusted pr for button
          />
          <Button
            onClick={handleSearch}
            disabled={!searchTerm.trim() || isSearching}
            className="absolute right-2" // Removed top-1/2 and transform
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Examples */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {searchType === 'attack' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('privilege escalation')}
                  className="text-xs"
                >
                  privilege escalation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('lateral movement')}
                  className="text-xs"
                >
                  lateral movement
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('credential access')}
                  className="text-xs"
                >
                  credential access
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('defense evasion')}
                  className="text-xs"
                >
                  defense evasion
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('T1078')}
                  className="text-xs"
                >
                  T1078 (Valid Accounts)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('T1021')}
                  className="text-xs"
                >
                  T1021 (Remote Services)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('T1003')}
                  className="text-xs"
                >
                  T1003 (Credential Dumping)
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length} events found)
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <Database size={16} className="mr-1" />
              <span>Click events to add to your query</span>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                isSelected={isEventSelected(event)}
                onClick={() => onEventSelect?.(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {results.length === 0 && searchTerm && !isSearching && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">
            Try searching with different keywords or browse the{' '}
            <Button variant="link" className="p-0 h-auto text-blue-500 hover:text-blue-600">
              complete event catalog
            </Button>
          </p>
        </div>
      )}
    </div>
  )
}
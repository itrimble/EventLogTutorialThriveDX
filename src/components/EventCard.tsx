'use client'

import { EventMapping } from '@/data/eventMappings'
import { cn, formatEventId } from '@/lib/utils'
import { Shield, AlertTriangle, Database, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EventCardProps {
  event: EventMapping
  isSelected?: boolean
  onClick?: () => void
}

export function EventCard({ event, isSelected = false, onClick }: EventCardProps) {
  const getSeverityBadgeVariant = (severity: string): { variant: "default" | "secondary" | "destructive" | "outline", className?: string } => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return { variant: 'destructive' }
      case 'medium':
        return { variant: 'outline', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' }
      case 'low':
        return { variant: 'outline', className: 'bg-green-100 text-green-700 border-green-300' }
      default:
        return { variant: 'secondary' }
    }
  }

  const severityBadgeStyle = getSeverityBadgeVariant(event.severity);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected
          ? "bg-blue-50 border-blue-300 shadow-sm ring-2 ring-blue-300" // Added ring for better visibility
          : "bg-white border-gray-200 hover:border-gray-300"
      )}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10"> {/* Ensure z-index for visibility */}
          <CheckCircle className="text-blue-500" size={20} />
        </div>
      )}

      <CardHeader className="pb-2"> {/* Reduced padding bottom */}
        <div className="flex items-start justify-between">
          <CardTitle className="font-mono text-lg font-bold text-gray-900">
            {formatEventId(event.eventId)}
          </CardTitle>
          <Badge variant={severityBadgeStyle.variant} className={cn("text-xs font-medium", severityBadgeStyle.className)}>
            {event.severity.toUpperCase()}
          </Badge>
        </div>
        <CardDescription className="font-medium text-gray-900 leading-tight pt-1"> {/* Added padding top */}
          {event.eventName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-2 pb-4"> {/* Adjusted padding */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>

        {/* Log Source */}
        <div className="flex items-center space-x-2">
          <Database size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">{event.logSource}</span>
        </div>

        {/* Attack Types */}
        {event.attackTypes && event.attackTypes.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={14} className="text-orange-500" />
              <span className="text-xs font-medium text-gray-700">Attack Types</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {event.attackTypes.slice(0, 3).map((type, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                >
                  {type}
                </Badge>
              ))}
              {event.attackTypes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.attackTypes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* MITRE Techniques */}
        {event.mitreTechniques && event.mitreTechniques.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield size={14} className="text-blue-500" />
              <span className="text-xs font-medium text-gray-700">MITRE Techniques</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {event.mitreTechniques.slice(0, 2).map((technique, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-blue-100 text-blue-700 border-blue-200 font-mono"
                >
                  {technique}
                </Badge>
              ))}
              {event.mitreTechniques.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.mitreTechniques.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Hover State Indicator (implicit via Card's hover state and border changes) */}
      {/* The original explicit hover div might not be needed if Card's hover styles are sufficient */}
      {/* If specific hover border is still needed, it can be handled by Card's className logic */}
    </Card>
  )
}
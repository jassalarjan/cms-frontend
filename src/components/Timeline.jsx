import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import { format, isToday, isYesterday } from 'date-fns';

const Timeline = ({ events = [], className = "" }) => {
  const getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    
    if (isToday(then)) return format(then, 'h:mm a');
    if (isYesterday(then)) return 'Yesterday';
    
    const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (days <= 7) return `${days} days ago`;
    
    return format(then, 'MMM dd, yyyy');
  };

  const getEventIcon = (type, status = null) => {
    switch (type) {
      case 'created':
        return { 
          icon: ExclamationTriangleIconSolid, 
          color: 'text-blue-600', 
          bg: 'bg-blue-100', 
          border: 'border-blue-200' 
        };
      case 'status_change':
        if (status === 'RESOLVED' || status === 'CLOSED') {
          return { 
            icon: CheckCircleIconSolid, 
            color: 'text-green-600', 
            bg: 'bg-green-100', 
            border: 'border-green-200' 
          };
        } else if (status === 'IN_PROGRESS') {
          return { 
            icon: ClockIconSolid, 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-100', 
            border: 'border-yellow-200' 
          };
        }
        return { 
          icon: ArrowRightIcon, 
          color: 'text-orange-600', 
          bg: 'bg-orange-100', 
          border: 'border-orange-200' 
        };
      case 'response':
        return { 
          icon: ChatBubbleLeftRightIcon, 
          color: 'text-purple-600', 
          bg: 'bg-purple-100', 
          border: 'border-purple-200' 
        };
      case 'assignment':
        return { 
          icon: UserIcon, 
          color: 'text-indigo-600', 
          bg: 'bg-indigo-100', 
          border: 'border-indigo-200' 
        };
      case 'note':
        return { 
          icon: CalendarIcon, 
          color: 'text-gray-600', 
          bg: 'bg-gray-100', 
          border: 'border-gray-200' 
        };
      default:
        return { 
          icon: ClockIcon, 
          color: 'text-gray-600', 
          bg: 'bg-gray-100', 
          border: 'border-gray-200' 
        };
    }
  };

  const getEventTitle = (event) => {
    switch (event.type) {
      case 'created':
        return 'Complaint submitted';
      case 'status_change':
        return `Status changed to ${event.new_status?.replace('_', ' ')?.toLowerCase()}`;
      case 'response':
        return event.user_type === 'admin' ? 'Admin responded' : 'Response added';
      case 'assignment':
        return `Assigned to ${event.assigned_to}`;
      case 'note':
        return 'Note added';
      default:
        return event.title || 'Activity';
    }
  };

  const getEventDescription = (event) => {
    if (event.description || event.message) {
      return event.description || event.message;
    }

    switch (event.type) {
      case 'created':
        return `Complaint was created with ${event.priority?.toLowerCase() || 'normal'} priority`;
      case 'status_change':
        return event.reason || `Status updated from ${event.old_status?.replace('_', ' ')?.toLowerCase()} to ${event.new_status?.replace('_', ' ')?.toLowerCase()}`;
      case 'response':
        return event.response || 'A response was provided';
      case 'assignment':
        return `Complaint assigned to ${event.assigned_to} for resolution`;
      case 'note':
        return event.note || 'Internal note was added';
      default:
        return event.details || 'Activity occurred';
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((event, eventIdx) => {
            const iconConfig = getEventIcon(event.type, event.new_status);
            const IconComponent = iconConfig.icon;
            
            return (
              <li key={event.id || eventIdx}>
                <div className="relative pb-8">
                  {eventIdx !== events.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  
                  <div className="relative flex space-x-3">
                    {/* Icon */}
                    <div>
                      <span className={`h-8 w-8 rounded-full ${iconConfig.bg} ${iconConfig.border} border-2 flex items-center justify-center ring-8 ring-white`}>
                        <IconComponent className={`h-4 w-4 ${iconConfig.color}`} />
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {getEventTitle(event)}
                          </p>
                          {event.user_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              by {event.user_name} ({event.user_type || 'system'})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {getTimeAgo(event.created_at || event.timestamp)}
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {getEventDescription(event)}
                        </p>
                        
                        {/* Additional Details */}
                        {event.files && event.files.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Attachments:</p>
                            <div className="flex flex-wrap gap-1">
                              {event.files.map((file, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                                  {file.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Priority Change */}
                        {event.type === 'priority_change' && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.old_priority === 'HIGH' || event.old_priority === 'URGENT' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {event.old_priority}
                            </span>
                            <ArrowRightIcon className="h-3 w-3 text-gray-400" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.new_priority === 'HIGH' || event.new_priority === 'URGENT' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {event.new_priority}
                            </span>
                          </div>
                        )}
                        
                        {/* Response Preview */}
                        {event.type === 'response' && event.response && event.response.length > 100 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700">
                              {event.response.substring(0, 100)}...
                            </p>
                            <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                              Read more
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Summary */}
      {events.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {events.length} event{events.length !== 1 ? 's' : ''} in timeline
            </span>
            <span>
              Created {getTimeAgo(events[events.length - 1]?.created_at || events[events.length - 1]?.timestamp)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;

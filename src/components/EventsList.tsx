
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatDate, formatLocation } from '../utils/geoUtils';
import { Radar, MapPin, Map } from 'lucide-react';
import { Badge } from './ui/badge';

const EventsList: React.FC = () => {
  const { events, setSelectedEvent, selectedEvent, deleteEvent, getAffectedPeople } = useAppContext();

  if (events.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No events have been added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          Click on an event to see details and affected people
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => {
            const affectedPeople = getAffectedPeople(event.id).length;
            const isSelected = selectedEvent?.id === event.id;
            
            return (
              <Card 
                key={event.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setSelectedEvent(isSelected ? null : event)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</p>
                    
                    <div className="flex items-center gap-1 mt-2">
                      <Badge variant={event.type === 'emergency' ? 'destructive' : 'outline'}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Radar className="h-3 w-3" />
                      <span>{event.radiusKm} km</span>
                    </Badge>
                    
                    <Badge variant="secondary" className="flex items-center gap-1 ml-1">
                      <MapPin className="h-3 w-3" />
                      <span>{affectedPeople}</span>
                    </Badge>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">{event.description}</p>
                    
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Map className="h-3 w-3" />
                      <span>{formatLocation(event.location)}</span>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                      >
                        Delete Event
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsList;

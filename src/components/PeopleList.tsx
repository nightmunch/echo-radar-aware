
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatLocation } from '../utils/geoUtils';
import { User, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface PeopleListProps {
  showAffectedOnly?: boolean;
}

const PeopleList: React.FC<PeopleListProps> = ({ showAffectedOnly = false }) => {
  const { people, deletePerson, selectedEvent } = useAppContext();
  
  // Filter people based on props and selected event
  const filteredPeople = showAffectedOnly && selectedEvent
    ? people.filter(person => {
        const isAffected = person.isAffected;
        return isAffected;
      })
    : people;

  if (filteredPeople.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {showAffectedOnly ? 'Affected People' : 'All People'}
          </CardTitle>
          {showAffectedOnly && selectedEvent && (
            <CardDescription>For {selectedEvent.name}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            {showAffectedOnly
              ? 'No affected people in this area'
              : 'No people have been added yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {showAffectedOnly ? 'Affected People' : 'All People'}
        </CardTitle>
        {showAffectedOnly && selectedEvent && (
          <CardDescription>For {selectedEvent.name}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${person.isAffected ? 'bg-radar-alert/10' : 'bg-green-500/10'}`}>
                    <User className={`h-4 w-4 ${person.isAffected ? 'text-radar-alert' : 'text-green-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{person.name}</h3>
                    {person.phoneNumber && (
                      <p className="text-xs text-muted-foreground">{person.phoneNumber}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <Badge variant={person.isAffected ? 'destructive' : 'outline'} className="mb-1">
                    {person.isAffected ? 'At Risk' : 'Safe'}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{formatLocation(person.location)}</span>
                  </div>
                </div>
              </div>
              
              {!showAffectedOnly && (
                <div className="mt-2 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deletePerson(person.id)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeopleList;


import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Event, Person, GeoLocation } from '../types';
import { calculateDistance } from '../utils/geoUtils';
import { toast } from '../components/ui/sonner';

interface AppContextProps {
  events: Event[];
  people: Person[];
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (id: string) => void;
  addPerson: (person: Omit<Person, 'id' | 'isAffected'>) => void;
  deletePerson: (id: string) => void;
  getAffectedPeople: (eventId: string) => Person[];
  mapCenter: GeoLocation;
  setMapCenter: (center: GeoLocation) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Sample data for initial state
const initialEvents: Event[] = [
  {
    id: '1',
    name: 'Earthquake Alert',
    description: 'Moderate earthquake reported in the area',
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    radiusKm: 5,
    timestamp: Date.now(),
    type: 'natural'
  }
];

const initialPeople: Person[] = [
  {
    id: '1',
    name: 'John Doe',
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    phoneNumber: '555-123-4567'
  },
  {
    id: '2',
    name: 'Jane Smith',
    location: { lat: 37.7739, lng: -122.4312 }, // Near San Francisco
    phoneNumber: '555-987-6543'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    location: { lat: 37.8049, lng: -122.4094 }, // Further away
    phoneNumber: '555-456-7890'
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapCenter, setMapCenter] = useState<GeoLocation>({ lat: 37.7749, lng: -122.4194 }); // Default to SF
  const [mapZoom, setMapZoom] = useState<number>(12); // Default zoom level

  // Update people's affected status when events or people change
  useEffect(() => {
    const updatedPeople = people.map(person => {
      let isAffected = false;
      
      for (const event of events) {
        const distance = calculateDistance(
          person.location.lat, person.location.lng,
          event.location.lat, event.location.lng
        );
        
        if (distance <= event.radiusKm) {
          isAffected = true;
          break;
        }
      }
      
      return { ...person, isAffected };
    });
    
    setPeople(updatedPeople);
  }, [events, people.length]);

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent = { ...eventData, id: generateId() };
    setEvents([...events, newEvent]);
    toast.success("Event added successfully");
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
    toast.info("Event removed");
  };

  const addPerson = (personData: Omit<Person, 'id' | 'isAffected'>) => {
    const newPerson = { ...personData, id: generateId() };
    setPeople([...people, newPerson]);
    toast.success("Person added successfully");
  };

  const deletePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
    toast.info("Person removed");
  };

  const getAffectedPeople = (eventId: string): Person[] => {
    const event = events.find(e => e.id === eventId);
    if (!event) return [];

    return people.filter(person => {
      const distance = calculateDistance(
        person.location.lat, person.location.lng,
        event.location.lat, event.location.lng
      );
      return distance <= event.radiusKm;
    });
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  return (
    <AppContext.Provider
      value={{
        events,
        people,
        selectedEvent,
        setSelectedEvent,
        addEvent,
        deleteEvent,
        addPerson,
        deletePerson,
        getAffectedPeople,
        mapCenter,
        setMapCenter,
        mapZoom,
        setMapZoom
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

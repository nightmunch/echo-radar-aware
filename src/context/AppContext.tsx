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

// Sample data for initial state with Malaysian locations
const initialEvents: Event[] = [
  {
    id: '1',
    name: 'Flood Warning',
    description: 'Heavy rainfall causing flooding in low-lying areas',
    location: { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
    radiusKm: 5,
    timestamp: Date.now(),
    type: 'natural'
  }
];

const initialPeople: Person[] = [
  {
    id: '1',
    name: 'Ahmad Razali',
    location: { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
    phoneNumber: '012-345-6789'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    location: { lat: 3.1380, lng: 101.6912 }, // Near KL city center
    phoneNumber: '019-876-5432'
  },
  {
    id: '3',
    name: 'Raj Kumar',
    location: { lat: 3.0698, lng: 101.6048 }, // Subang Jaya area
    phoneNumber: '017-123-4567'
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapCenter, setMapCenter] = useState<GeoLocation>({ lat: 3.1390, lng: 101.6869 }); // Default to Kuala Lumpur
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

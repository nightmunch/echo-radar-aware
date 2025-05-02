
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Navigation, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { GeoLocation } from '../types';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistance } from '../utils/geoUtils';

// Fix for Leaflet marker icons
// Import marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Set default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  onLocationSelect?: (location: GeoLocation) => void;
  isSelectingLocation?: boolean;
}

// Component to handle map events and center changes
function MapEvents({ setMapCenter, setMapZoom }: { 
  setMapCenter: (center: GeoLocation) => void;
  setMapZoom: (zoom: number) => void;
}) {
  const map = useMap();
  
  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      setMapCenter({
        lat: center.lat,
        lng: center.lng
      });
      setMapZoom(map.getZoom());
    }
  });
  
  return null;
}

// Component for location selection mode
function SelectLocationMarker({ 
  isSelectingLocation, 
  onLocationSelect 
}: { 
  isSelectingLocation: boolean; 
  onLocationSelect?: (location: GeoLocation) => void;
}) {
  const map = useMap();
  
  useMapEvents({
    click: (e) => {
      if (isSelectingLocation && onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    }
  });
  
  return isSelectingLocation ? (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="9" stroke="#0EA5E9" strokeWidth="2"/>
        <line x1="20" y1="5" x2="20" y2="15" stroke="#0EA5E9" strokeWidth="2"/>
        <line x1="20" y1="25" x2="20" y2="35" stroke="#0EA5E9" strokeWidth="2"/>
        <line x1="35" y1="20" x2="25" y2="20" stroke="#0EA5E9" strokeWidth="2"/>
        <line x1="15" y1="20" x2="5" y2="20" stroke="#0EA5E9" strokeWidth="2"/>
      </svg>
    </div>
  ) : null;
}

// Component to center map on user's location
function CenterOnUser({ userLocation }: { userLocation: GeoLocation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation, map]);
  
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  isSelectingLocation = false
}) => {
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [centerOnUserClicked, setCenterOnUserClicked] = useState(false);
  
  const { 
    events, 
    people, 
    selectedEvent, 
    setSelectedEvent,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom
  } = useAppContext();

  // Get user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userLoc);
        
        // If no events, center on user
        if (events.length === 0) {
          setMapCenter(userLoc);
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
      }
    );
  }, [events, setMapCenter]);

  // Custom markers for events and people
  const createEventIcon = () => {
    return L.divIcon({
      className: 'custom-event-icon',
      html: `<div class="w-6 h-6 bg-event text-white rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2Z"/><path d="M12 22v-10h10"/><path d="M12 12V2h10"/></svg>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const createPersonIcon = (isAffected: boolean) => {
    return L.divIcon({
      className: 'custom-person-icon',
      html: `<div class="w-5 h-5 ${isAffected ? 'bg-radar-alert' : 'bg-green-500'} text-white rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Handle user location button click
  const goToUserLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setCenterOnUserClicked(true);
    }
  };

  // Select current map center
  const selectCurrentLocation = () => {
    if (onLocationSelect) {
      onLocationSelect(mapCenter);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        className="rounded-md overflow-hidden"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map Events Handler */}
        <MapEvents setMapCenter={setMapCenter} setMapZoom={setMapZoom} />
        
        {/* Selection Mode */}
        <SelectLocationMarker isSelectingLocation={isSelectingLocation} onLocationSelect={onLocationSelect} />
        
        {/* Center on user when requested */}
        {centerOnUserClicked && userLocation && <CenterOnUser userLocation={userLocation} />}
        
        {/* Event Markers and Circles */}
        {events.map(event => (
          <React.Fragment key={event.id}>
            <Marker 
              position={[event.location.lat, event.location.lng]} 
              eventHandlers={{
                click: () => setSelectedEvent(event)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{event.name}</h3>
                  <p className="text-sm">{event.description}</p>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[event.location.lat, event.location.lng]}
              pathOptions={{
                color: selectedEvent?.id === event.id ? '#ea384c' : '#0EA5E9',
                fillColor: selectedEvent?.id === event.id ? '#ea384c' : '#0EA5E9',
                fillOpacity: 0.2,
                weight: 2
              }}
              radius={event.radiusKm * 1000}
              eventHandlers={{
                click: () => setSelectedEvent(event)
              }}
            />
          </React.Fragment>
        ))}
        
        {/* People Markers */}
        {people.map(person => (
          <Marker 
            key={person.id}
            position={[person.location.lat, person.location.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{person.name}</h3>
                {person.phoneNumber && <p className="text-sm">{person.phoneNumber}</p>}
                <p className={`text-sm ${person.isAffected ? 'text-radar-alert font-bold' : 'text-green-500'}`}>
                  {person.isAffected ? 'In affected area' : 'Safe area'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {userLocation && (
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={goToUserLocation} 
            className="w-10 h-10 rounded-full bg-white shadow-md"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        )}
        
        {isSelectingLocation && (
          <Button 
            variant="default" 
            onClick={selectCurrentLocation} 
            className="rounded-full shadow-md flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Set Location</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MapComponent;

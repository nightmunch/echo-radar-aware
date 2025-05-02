
import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Navigation, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { GeoLocation } from '../types';

// Replace this with your own Mapbox token when using this app
const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN';

interface MapComponentProps {
  onLocationSelect?: (location: GeoLocation) => void;
  isSelectingLocation?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  isSelectingLocation = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [mapboxPromise, setMapboxPromise] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(MAPBOX_TOKEN);
  
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

  const [tokenModalOpen, setTokenModalOpen] = useState(
    !mapboxToken || mapboxToken === 'YOUR_MAPBOX_TOKEN'
  );

  // Dynamically load Mapbox
  useEffect(() => {
    // Skip if we don't have a token yet
    if (!mapboxToken || mapboxToken === 'YOUR_MAPBOX_TOKEN') return;

    if (!mapboxPromise) {
      const promise = import('mapbox-gl').then(mapboxgl => {
        import('mapbox-gl/dist/mapbox-gl.css');
        mapboxgl.default.accessToken = mapboxToken;
        return mapboxgl.default;
      });
      setMapboxPromise(promise);
    }
  }, [mapboxPromise, mapboxToken]);

  // Initialize map when container and mapbox are ready
  useEffect(() => {
    if (!mapContainerRef.current || !mapboxPromise || mapLoaded) return;

    const initializeMap = async () => {
      try {
        const mapboxgl = await mapboxPromise;
        
        // Create map instance
        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [mapCenter.lng, mapCenter.lat],
          zoom: mapZoom,
          pitch: 0,
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Once map is loaded
        map.on('load', () => {
          setMapInstance(map);
          setMapLoaded(true);
          
          // Get user's current location if available
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLoc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(userLoc);
              
              // If no events, center on user
              if (events.length === 0) {
                map.flyTo({
                  center: [userLoc.lng, userLoc.lat],
                  zoom: 12
                });
                setMapCenter(userLoc);
              }
            },
            (error) => {
              console.error('Error getting user location:', error);
            }
          );
        });

        map.on('move', () => {
          const center = map.getCenter();
          setMapCenter({
            lat: center.lat,
            lng: center.lng
          });
          setMapZoom(map.getZoom());
        });
        
        if (isSelectingLocation) {
          // Show crosshairs in center for location selection
          const center = document.createElement('div');
          center.className = 'absolute inset-1/2 w-6 h-6 -ml-3 -mt-3 pointer-events-none';
          center.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary w-6 h-6"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`;
          mapContainerRef.current?.appendChild(center);
        }

        return map;
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapLoaded(false);
      }
    };

    initializeMap();
  }, [mapContainerRef, mapboxPromise, mapLoaded, isSelectingLocation, mapCenter]);

  // Handle rendering of events and people on the map
  useEffect(() => {
    if (!mapInstance || !mapLoaded) return;

    // Clear any existing markers
    const existingMarkers = document.querySelectorAll('.map-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    const existingCircles = document.querySelectorAll('.map-circle');
    existingCircles.forEach(circle => circle.remove());

    // Add events with radius circles
    events.forEach(event => {
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'map-marker';
      markerElement.innerHTML = `
        <div class="w-6 h-6 bg-event text-white rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2Z"/><path d="M12 22v-10h10"/><path d="M12 12V2h10"/></svg>
        </div>
      `;
      
      markerElement.addEventListener('click', () => {
        setSelectedEvent(event);
      });

      // Add event marker
      new mapboxgl.Marker({ element: markerElement })
        .setLngLat([event.location.lng, event.location.lat])
        .addTo(mapInstance);
      
      // Add radius circle
      const circleElement = document.createElement('div');
      circleElement.className = `map-circle absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-radar ${selectedEvent?.id === event.id ? 'bg-radar-alert' : 'bg-radar-primary'}`;
      
      // Calculate pixel radius at current zoom level
      const y = mapInstance.project([event.location.lng, event.location.lat]).y;
      const lat = event.location.lat;
      
      // Calculate the point at the given distance along the equator
      const lngDelta = event.radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));
      const latLngPoint = [event.location.lng + lngDelta, lat];
      const radiusInPixels = Math.abs(
        mapInstance.project(latLngPoint).x -
        mapInstance.project([event.location.lng, lat]).x
      );
      
      // Style the circle
      circleElement.style.width = `${radiusInPixels * 2}px`;
      circleElement.style.height = `${radiusInPixels * 2}px`;
      circleElement.style.left = `${mapInstance.project([event.location.lng, event.location.lat]).x}px`;
      circleElement.style.top = `${mapInstance.project([event.location.lng, event.location.lat]).y}px`;
      circleElement.style.opacity = selectedEvent?.id === event.id ? '0.4' : '0.2';
      circleElement.style.border = `2px solid ${selectedEvent?.id === event.id ? '#ea384c' : '#0EA5E9'}`;
      
      mapInstance.getCanvasContainer().appendChild(circleElement);
    });

    // Add people markers
    people.forEach(person => {
      const personMarker = document.createElement('div');
      personMarker.className = 'map-marker';
      personMarker.innerHTML = `
        <div class="w-5 h-5 ${person.isAffected ? 'bg-radar-alert' : 'bg-green-500'} text-white rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
        </div>
      `;

      personMarker.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute z-50 bg-white p-2 rounded shadow-lg text-xs';
        tooltip.innerHTML = `
          <p class="font-bold">${person.name}</p>
          <p>${person.phoneNumber || 'No phone'}</p>
          <p class="${person.isAffected ? 'text-radar-alert font-bold' : 'text-green-500'}">
            ${person.isAffected ? 'In affected area' : 'Safe area'}
          </p>
        `;
        personMarker.appendChild(tooltip);
      });

      personMarker.addEventListener('mouseleave', () => {
        const tooltip = personMarker.querySelector('.absolute');
        if (tooltip) tooltip.remove();
      });

      new mapboxgl.Marker({ element: personMarker })
        .setLngLat([person.location.lng, person.location.lat])
        .addTo(mapInstance);
    });
    
    // Update circle positions on map move
    const updateCircles = () => {
      const circles = document.querySelectorAll('.map-circle');
      circles.forEach((circle: any, index) => {
        if (index >= events.length) return;
        
        const event = events[index];
        const y = mapInstance.project([event.location.lng, event.location.lat]).y;
        const lat = event.location.lat;
        
        // Calculate radius in pixels at current zoom level
        const lngDelta = event.radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));
        const latLngPoint = [event.location.lng + lngDelta, lat];
        const radiusInPixels = Math.abs(
          mapInstance.project(latLngPoint).x -
          mapInstance.project([event.location.lng, lat]).x
        );
        
        circle.style.width = `${radiusInPixels * 2}px`;
        circle.style.height = `${radiusInPixels * 2}px`;
        circle.style.left = `${mapInstance.project([event.location.lng, event.location.lat]).x}px`;
        circle.style.top = `${mapInstance.project([event.location.lng, event.location.lat]).y}px`;
      });
    };
    
    mapInstance.on('move', updateCircles);
    mapInstance.on('zoom', updateCircles);
    
    // Cleanup
    return () => {
      mapInstance.off('move', updateCircles);
      mapInstance.off('zoom', updateCircles);
    };
  }, [mapInstance, mapLoaded, events, people, selectedEvent]);

  // Location selection
  useEffect(() => {
    if (!mapInstance || !isSelectingLocation) return;

    const handleClick = () => {
      if (onLocationSelect) {
        const center = mapInstance.getCenter();
        onLocationSelect({
          lat: center.lat,
          lng: center.lng
        });
      }
    };

    mapInstance.once('click', handleClick);

    return () => {
      mapInstance.off('click', handleClick);
    };
  }, [mapInstance, isSelectingLocation, onLocationSelect]);

  const handleMapBoxTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    if (input.value) {
      setMapboxToken(input.value);
      setTokenModalOpen(false);
    }
  };

  // Handle user location button click
  const goToUserLocation = () => {
    if (!mapInstance || !userLocation) return;
    
    mapInstance.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 14
    });
  };

  // Select current map center
  const selectCurrentLocation = () => {
    if (!mapInstance || !onLocationSelect) return;
    
    const center = mapInstance.getCenter();
    onLocationSelect({
      lat: center.lat,
      lng: center.lng
    });
  };

  // Token input modal
  if (tokenModalOpen) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 p-4">
        <Card className="p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Mapbox Access Token Required</h2>
          <p className="mb-4">To use the map functionality, please enter your Mapbox access token:</p>
          <form onSubmit={handleMapBoxTokenSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your Mapbox access token"
              className="w-full p-2 border rounded"
              required
            />
            <Button type="submit" className="w-full">Submit Token</Button>
          </form>
          <p className="text-xs mt-4 text-muted-foreground">
            You can get a token from <a href="https://mapbox.com/" target="_blank" rel="noreferrer" className="underline">mapbox.com</a>
          </p>
        </Card>
      </div>
    );
  }

  // Loading state
  if (!mapLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-md overflow-hidden" />
      
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


export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Person {
  id: string;
  name: string;
  location: GeoLocation;
  phoneNumber?: string;
  isAffected?: boolean;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  location: GeoLocation;
  radiusKm: number;
  timestamp: number;
  type: 'natural' | 'emergency' | 'community' | 'other';
}

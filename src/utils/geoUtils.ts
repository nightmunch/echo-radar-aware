
import { GeoLocation } from '../types';

// Calculate distance between two coordinates in km using the Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Format a location into a human-readable string
export function formatLocation(location: GeoLocation): string {
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}

// Format timestamp to human-readable date
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

// Generate a random color for event visualization
export function getEventTypeColor(type: string): string {
  switch (type) {
    case 'natural':
      return '#F97316'; // Orange
    case 'emergency':
      return '#ea384c'; // Red
    case 'community':
      return '#0EA5E9'; // Blue
    default:
      return '#8B5CF6'; // Purple
  }
}

// Get icon name for event type
export function getEventTypeIcon(type: string): string {
  switch (type) {
    case 'natural':
      return 'alert-triangle';
    case 'emergency':
      return 'alert-circle';
    case 'community':
      return 'users';
    default:
      return 'info';
  }
}

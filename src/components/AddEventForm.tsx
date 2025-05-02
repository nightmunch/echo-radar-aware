
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import MapComponent from './Map';
import { GeoLocation } from '../types';
import { formatLocation } from '../utils/geoUtils';

const AddEventForm: React.FC = () => {
  const { addEvent, mapCenter } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'natural' | 'emergency' | 'community' | 'other'>('emergency');
  const [radiusKm, setRadiusKm] = useState(1);
  const [location, setLocation] = useState<GeoLocation>(mapCenter);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !location) {
      return;
    }
    
    addEvent({
      name,
      description,
      location,
      radiusKm,
      timestamp: Date.now(),
      type
    });
    
    // Reset form
    setName('');
    setDescription('');
    setRadiusKm(1);
    setType('emergency');
    setIsSelectingLocation(false);
  };

  const handleLocationSelect = (loc: GeoLocation) => {
    setLocation(loc);
    setIsSelectingLocation(false);
  };

  if (isSelectingLocation) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-background p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Select Event Location</h2>
          <Button variant="outline" onClick={() => setIsSelectingLocation(false)}>Cancel</Button>
        </div>
        <div className="flex-1">
          <MapComponent 
            onLocationSelect={handleLocationSelect}
            isSelectingLocation={true}
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Earthquake, Fire, etc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about this event"
              required
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural Disaster</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="community">Community Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Impact Radius (km): {radiusKm}</Label>
            <Slider 
              value={[radiusKm]} 
              onValueChange={(value) => setRadiusKm(value[0])} 
              min={0.1} 
              max={10} 
              step={0.1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={formatLocation(location)} 
                readOnly
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSelectingLocation(true)}
              >
                Select on Map
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full">Add Event</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEventForm;


import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import MapComponent from './Map';
import { GeoLocation } from '../types';
import { formatLocation } from '../utils/geoUtils';

const AddPersonForm: React.FC = () => {
  const { addPerson, mapCenter } = useAppContext();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<GeoLocation>(mapCenter);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location) {
      return;
    }
    
    addPerson({
      name,
      location,
      phoneNumber
    });
    
    // Reset form
    setName('');
    setPhoneNumber('');
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
          <h2 className="text-lg font-medium">Select Person Location</h2>
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
        <CardTitle>Add New Person</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Person Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="555-123-4567"
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
          
          <Button type="submit" className="w-full">Add Person</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPersonForm;

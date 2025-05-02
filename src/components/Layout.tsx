
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { CircleUserRound, Radar, MapPin, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('map');

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Radar className="h-6 w-6 text-radar-primary" />
          <h1 className="text-xl font-bold">Echo Radar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add New</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <Tabs defaultValue="event" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="event">Add Event</TabsTrigger>
                  <TabsTrigger value="person">Add Person</TabsTrigger>
                </TabsList>
                <TabsContent value="event">
                  {/* AddEventForm will be rendered here by the Home component */}
                </TabsContent>
                <TabsContent value="person">
                  {/* AddPersonForm will be rendered here by the Home component */}
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      
      <nav className="border-t md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-16">
            <TabsTrigger value="map" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-secondary">
              <MapPin className="h-5 w-5" />
              <span className="text-xs">Map</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-secondary">
              <Radar className="h-5 w-5" />
              <span className="text-xs">Events</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-secondary">
              <CircleUserRound className="h-5 w-5" />
              <span className="text-xs">People</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>
    </div>
  );
};

export default Layout;

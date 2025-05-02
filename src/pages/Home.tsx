
import React, { useState } from 'react';
import Layout from '../components/Layout';
import MapComponent from '../components/Map';
import EventsList from '../components/EventsList';
import PeopleList from '../components/PeopleList';
import AddEventForm from '../components/AddEventForm';
import AddPersonForm from '../components/AddPersonForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useIsMobile } from '../hooks/use-mobile';

const Home: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('events');
  const { selectedEvent } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="flex h-full relative">
        {/* Map - Always visible for desktop, conditionally for mobile */}
        <div className={`
          transition-all
          ${isMobile ? 'absolute inset-0 z-10' : 'flex-1'}
          ${isMobile && mobileSidebarOpen ? 'translate-x-[80%] opacity-30 pointer-events-none' : ''}
        `}>
          <MapComponent />
          
          {isMobile && !mobileSidebarOpen && (
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-4 left-4 rounded-full shadow-lg"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Sidebar - Desktop version */}
        <div className={`
          w-96 border-l p-4 overflow-y-auto flex flex-col gap-4 hidden md:flex
        `}>
          {selectedEvent ? (
            <PeopleList showAffectedOnly={true} />
          ) : (
            <div className="flex space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="flex-1 gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Event</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <AddEventForm />
                </SheetContent>
              </Sheet>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Person</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <AddPersonForm />
                </SheetContent>
              </Sheet>
            </div>
          )}
          
          <Tabs defaultValue="events" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="flex-1 overflow-y-auto pb-4">
              <EventsList />
            </TabsContent>
            
            <TabsContent value="people" className="flex-1 overflow-y-auto pb-4">
              <PeopleList />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Mobile sidebar */}
        {isMobile && (
          <div className={`
            absolute left-0 top-0 bottom-0 z-20 w-4/5 bg-background transition-transform
            transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col overflow-hidden
          `}>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold">Details</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileSidebarOpen(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="people">People</TabsTrigger>
                </TabsList>
                
                <TabsContent value="events" className="space-y-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Event
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85%]">
                      <AddEventForm />
                    </SheetContent>
                  </Sheet>
                  
                  <EventsList />
                </TabsContent>
                
                <TabsContent value="people" className="space-y-4">
                  {selectedEvent ? (
                    <PeopleList showAffectedOnly={true} />
                  ) : (
                    <>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Person
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85%]">
                          <AddPersonForm />
                        </SheetContent>
                      </Sheet>
                      
                      <PeopleList />
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;

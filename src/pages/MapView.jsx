import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, List, Filter } from 'lucide-react';
import MapView from '../components/map/MapView';
import JobAcceptanceFlow from '../components/job/JobAcceptanceFlow';
import JobTracker from '../components/job/JobTracker';

export default function MapViewPage() {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAcceptanceFlow, setShowAcceptanceFlow] = useState(false);
  const [activeJobs, setActiveJobs] = useState([]);
  const [view, setView] = useState('map');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const allJobs = await Job.list('-created_date');
      
      // Filter jobs based on user type
      if (currentUser.user_type === 'dasher') {
        // Show open jobs and jobs assigned to this dasher
        const openJobs = allJobs.filter(job => job.status === 'open');
        const myJobs = allJobs.filter(job => job.awarded_dasher_id === currentUser.id);
        setJobs(openJobs);
        setActiveJobs(myJobs);
      } else {
        // Show client's own jobs
        const myJobs = allJobs.filter(job => job.client_id === currentUser.id);
        setJobs(myJobs);
        setActiveJobs(myJobs.filter(job => job.status !== 'open'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    if (user?.user_type === 'dasher' && job.status === 'open') {
      setShowAcceptanceFlow(true);
    }
  };

  const handleJobAccepted = () => {
    setShowAcceptanceFlow(false);
    setSelectedJob(null);
    fetchData(); // Refresh data
  };

  const handleJobUpdate = (updatedJob) => {
    fetchData(); // Refresh data
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading map...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.user_type === 'dasher' ? 'Find Work Near You' : 'Your Jobs'}
          </h1>
          <p className="text-gray-600">
            {user?.user_type === 'dasher' 
              ? 'Browse available jobs on the map and accept the ones you want' 
              : 'Track the progress of your posted jobs'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            onClick={() => setView('map')}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Map
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            {user?.user_type === 'dasher' ? 'Available Jobs' : 'All Jobs'} ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            {user?.user_type === 'dasher' ? 'My Jobs' : 'Active Jobs'} ({activeJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {view === 'map' ? (
            <MapView 
              jobs={jobs} 
              onJobSelect={handleJobSelect}
              center={[40.7128, -74.0060]} // Default to NYC, could be user's location
            />
          ) : (
            <div className="grid gap-4">
              {jobs.map(job => (
                <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            ${job.budget}
                          </Badge>
                          <Badge variant="outline">
                            {job.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <Button onClick={() => handleJobSelect(job)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          <div className="grid gap-4">
            {activeJobs.map(job => (
              <JobTracker
                key={job.id}
                job={job}
                userType={user?.user_type}
                onJobUpdate={handleJobUpdate}
              />
            ))}
            {activeJobs.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">
                    {user?.user_type === 'dasher' 
                      ? "You haven't accepted any jobs yet." 
                      : "No active jobs at the moment."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Acceptance Flow Modal */}
      {showAcceptanceFlow && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <JobAcceptanceFlow
            job={selectedJob}
            onClose={() => {
              setShowAcceptanceFlow(false);
              setSelectedJob(null);
            }}
            onJobAccepted={handleJobAccepted}
          />
        </div>
      )}
    </div>
  );
}
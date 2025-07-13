
import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, DollarSign, Calendar, Search, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import JobBidModal from '../components/job/JobBidModal';

const JobCard = ({ job, onViewDetails }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 capitalize">
                    {job.category.replace('_', ' ')}
                </Badge>
            </div>
            <CardDescription className="pt-2">Posted {format(new Date(job.created_date), 'MMM d, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.city}, {job.state}</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget: ${job.budget}</span>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onViewDetails}>View Details & Bid</Button>
        </CardFooter>
    </Card>
);

export default function FindWorkPage() {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            const openJobs = await Job.filter({ status: 'open' }, '-created_date');
            setJobs(openJobs);
            setIsLoading(false);
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleViewDetails = (job) => {
        setSelectedJob(job);
    };

    const handleCloseModal = () => {
        setSelectedJob(null);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900">Find Your Next Gig</h1>
                <p className="text-lg text-gray-600 mt-2">Browse available jobs and start earning today.</p>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                         <label htmlFor="search" className="text-sm font-medium">Search Jobs</label>
                        <div className="relative">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                id="search"
                                placeholder="e.g., 'mow lawn' or 'gardening'"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">Category</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="lawn_mowing">Lawn Mowing</SelectItem>
                                <SelectItem value="gardening">Gardening</SelectItem>
                                <SelectItem value="landscaping">Landscaping</SelectItem>
                                <SelectItem value="gutter_cleaning">Gutter Cleaning</SelectItem>
                                <SelectItem value="tree_trimming">Tree Trimming</SelectItem>
                                <SelectItem value="weeding">Weeding</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full md:w-auto">Apply Filters</Button>
                </div>
            </div>

            {/* Job Listings */}
            {isLoading ? (
                <p>Loading jobs...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.length > 0 ? (
                         filteredJobs.map(job => (
                            <JobCard key={job.id} job={job} onViewDetails={() => handleViewDetails(job)} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                             <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                             <h3 className="text-xl font-semibold">No Jobs Found</h3>
                            <p className="text-gray-500">Try adjusting your filters or check back later!</p>
                        </div>
                    )}
                </div>
            )}

            {selectedJob && (
                <JobBidModal
                    job={selectedJob}
                    isOpen={!!selectedJob}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

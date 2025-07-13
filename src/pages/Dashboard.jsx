
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Job } from '@/api/entities';
import { Bid } from '@/api/entities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Briefcase, CheckCircle, Clock, PlusCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import DasherEarnings from '@/components/dashboard/DasherEarnings';

const JobListItem = ({ job, bids = [] }) => (
    <div className="p-4 border rounded-lg flex justify-between items-center">
        <div>
            <h4 className="font-semibold">{job.title}</h4>
            <p className="text-sm text-gray-500">{job.city}, {job.state} - ${job.budget}</p>
            <p className="text-xs text-gray-400">Posted: {format(new Date(job.created_date), 'MMM d')}</p>
        </div>
        <div className='text-right'>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${job.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {job.status}
            </span>
            {bids.length > 0 && <p className='text-sm mt-1'>{bids.length} bid(s)</p>}
        </div>
    </div>
);

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState('client');
    const [postedJobs, setPostedJobs] = useState([]);
    const [bids, setBids] = useState([]);
    const [awardedJobs, setAwardedJobs] = useState([]);
    const [paidJobs, setPaidJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setUserType(currentUser.user_type || 'client');

                if (currentUser.user_type === 'dasher') {
                    const [myBids, myAwardedJobs, myPaidJobs] = await Promise.all([
                        Bid.filter({ dasher_id: currentUser.id }),
                        Job.filter({ awarded_dasher_id: currentUser.id }),
                        Job.filter({ awarded_dasher_id: currentUser.id, status: 'paid' }, '-paid_at')
                    ]);
                    setBids(myBids);
                    setAwardedJobs(myAwardedJobs.filter(job => job.status !== 'paid'));
                    setPaidJobs(myPaidJobs);
                } else {
                    const myJobs = await Job.filter({ client_id: currentUser.id }, '-created_date');
                    setPostedJobs(myJobs);
                }
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to fetch dashboard data:", e);
                navigate(createPageUrl('Home'));
            }
        };
        fetchData();
    }, [navigate]);

    if (isLoading) {
        return <div className="container mx-auto py-8 text-center">Loading your dashboard...</div>;
    }

    const ClientDashboard = () => (
        <Card>
            <CardHeader>
                <CardTitle>My Posted Jobs</CardTitle>
                <CardDescription>Manage the jobs you've posted and review bids.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {postedJobs.length > 0 ? (
                    postedJobs.map(job => <JobListItem key={job.id} job={job} />)
                ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <Briefcase className="w-12 h-12 mx-auto text-gray-300"/>
                        <h3 className="mt-4 text-lg font-semibold">You haven't posted any jobs yet.</h3>
                        <p className="text-gray-500 mt-1">Ready to get started?</p>
                        <Button asChild className="mt-4"><Link to={createPageUrl('PostJob')}><PlusCircle className='w-4 h-4 mr-2'/>Post Your First Job</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const DasherDashboard = () => {
        return (
            <Tabs defaultValue="earnings">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                    <TabsTrigger value="awarded">Active Jobs</TabsTrigger>
                    <TabsTrigger value="bids">My Bids</TabsTrigger>
                    <TabsTrigger value="history">Job History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="earnings">
                    <DasherEarnings paidJobs={paidJobs} />
                </TabsContent>
                
                <TabsContent value="awarded">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Active Jobs</CardTitle>
                            <CardDescription>These are the jobs you've won that are in progress.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {awardedJobs.length > 0 ? (
                                awardedJobs.map(job => <JobListItem key={job.id} job={job} />)
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <Briefcase className="w-12 h-12 mx-auto text-gray-300"/>
                                    <h3 className="mt-4 text-lg font-semibold">No active jobs.</h3>
                                    <p className="text-gray-500 mt-1">Go find some work!</p>
                                    <Button asChild className="mt-4"><Link to={createPageUrl('FindWork')}><PlusCircle className='w-4 h-4 mr-2'/>Find Work</Link></Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="bids">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Bids</CardTitle>
                            <CardDescription>Track the status of bids you've placed on jobs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bids.length > 0 ? (
                                bids.map(bid => (
                                    <div key={bid.id} className="p-4 border rounded-lg flex justify-between items-center">
                                        <p>Bid for ${bid.amount} on a job</p>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {bid.status}
                                        </span>
                                    </div>
                                ))
                            ) : <p>You haven't placed any bids.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Completed Jobs</CardTitle>
                            <CardDescription>Your job history and payments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {paidJobs.length > 0 ? paidJobs.map(job => (
                                <div key={job.id} className="flex justify-between items-center p-4 border rounded-lg bg-white">
                                    <div>
                                        <p className="font-medium">{job.title}</p>
                                        <p className="text-sm text-gray-500">{job.city}, {job.state}</p>
                                        <p className="text-xs text-gray-400">Completed {format(new Date(job.completed_at), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">${job.payout_amount?.toFixed(2) || (job.final_amount * 0.9).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">Paid {format(new Date(job.paid_at), 'MMM d')}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-gray-500 py-8">
                                    <p>No completed jobs yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {user?.full_name}!</h1>
                <p className="text-gray-600">Here's what's happening with your Yardash account.</p>
            </div>
            {userType === 'client' ? <ClientDashboard /> : <DasherDashboard />}
        </div>
    );
}

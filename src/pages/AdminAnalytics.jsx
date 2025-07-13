
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Job } from '@/api/entities';
import { Bid } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Added Tabs components
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Users, Briefcase, Hand, Download, AlertTriangle, Loader2, CheckCircle, DollarSign, ShieldAlert } from 'lucide-react'; // Added DollarSign, ShieldAlert
import { format } from 'date-fns';
import { groupBy, map, countBy } from 'lodash';
import FinancialAnalytics from '@/components/admin/FinancialAnalytics'; // Added FinancialAnalytics component
import DisputeResolution from '@/components/admin/DisputeResolution'; // Added DisputeResolution component

// Helper to download data as CSV
const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            let field = row[header];
            if (typeof field === 'string') return `"${field.replace(/"/g, '""')}"`;
            if (Array.isArray(field) || typeof field === 'object' && field !== null) return `"${JSON.stringify(field).replace(/"/g, '""')}"`;
            return field;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [disputeCount, setDisputeCount] = useState(0); // Added disputeCount state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await User.me();
                if (currentUser.role !== 'admin') {
                    setIsAuthorized(false);
                    setIsLoading(false);
                    return;
                }
                setIsAuthorized(true);

                const [users, jobs, bids] = await Promise.all([
                    User.list('', 1000), // Set a high limit to get all users
                    Job.list('-created_date', 1000),
                    Bid.list('', 1000)
                ]);

                setAllUsers(users);
                setAllJobs(jobs);
                
                // Process job data for chart
                const jobPostings = map(
                    groupBy(jobs, job => format(new Date(job.created_date), 'yyyy-MM-dd')),
                    (group, date) => ({ date, count: group.length })
                ).sort((a, b) => new Date(a.date) - new Date(b.date));
                
                const jobStatusCounts = countBy(jobs, 'status');
                setDisputeCount(jobStatusCounts.disputed || 0); // Set dispute count

                // Process user data for chart
                const userSignups = map(
                    groupBy(users, user => format(new Date(user.created_date), 'yyyy-MM-dd')),
                    (group, date) => ({ date, count: group.length })
                ).sort((a, b) => new Date(a.date) - new Date(b.date));

                setStats({
                    totalUsers: users.length,
                    totalJobs: jobs.length,
                    totalBids: bids.length,
                    userSignups,
                    jobPostings,
                    jobStatusCounts,
                });

            } catch (error) {
                console.error("Failed to fetch analytics data", error);
                navigate(createPageUrl('Home'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="container mx-auto py-12 text-center">
                 <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-2xl">Access Denied</CardTitle>
                        <CardDescription className="mt-2">You do not have permission to view this page.</CardDescription>
                        <Button asChild className="mt-6">
                            <a href={createPageUrl('Home')}>Go to Homepage</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Admin Analytics</h1>
                <p className="text-gray-600">Comprehensive analytics and insights for the Yardash platform.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4"> {/* Changed to grid-cols-4 */}
                    <TabsTrigger value="overview">Platform Overview</TabsTrigger>
                    <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
                    <TabsTrigger value="disputes"> {/* Added Dispute Resolution Tab */}
                        Dispute Resolution
                        {disputeCount > 0 && <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">{disputeCount}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="data">Data Export</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    {/* Key Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                                <Hand className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalBids || 0}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                                 <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.jobStatusCounts?.completed || 0}</div>
                            </CardContent>
                        </Card>
                        {/* Added Disputed Jobs card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Disputed Jobs</CardTitle>
                                <ShieldAlert className={`h-4 w-4 ${disputeCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{disputeCount}</div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Signups Over Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={stats?.userSignups}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false}/>
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#10b981" name="New Users" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Postings Over Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats?.jobPostings}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false}/>
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#10b981" name="New Jobs"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financial">
                    <FinancialAnalytics />
                </TabsContent>
                
                {/* Added Dispute Resolution Tab Content */}
                <TabsContent value="disputes">
                    <DisputeResolution />
                </TabsContent>

                <TabsContent value="data">
                    {/* Data Downloads */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Downloads</CardTitle>
                            <CardDescription>Download raw data in CSV format for external analysis.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-4">
                            <Button 
                                variant="outline" 
                                onClick={() => downloadCSV(allUsers, 'yardash_users.csv')}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4"/>
                                Download All Users ({allUsers.length})
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => downloadCSV(allJobs, 'yardash_jobs.csv')}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4"/>
                                Download All Jobs ({allJobs.length})
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Clock } from 'lucide-react';
import { format, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { groupBy, sumBy } from 'lodash';

export default function DasherEarnings() {
    const [user, setUser] = useState(null);
    const [earnings, setEarnings] = useState({
        totalEarned: 0,
        thisWeek: 0,
        thisMonth: 0,
        completedJobs: 0,
        avgPerJob: 0,
        pendingPayouts: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [timeRange, setTimeRange] = useState('30');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEarningsData();
    }, [timeRange]);

    const fetchEarningsData = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);

            const [allTransactions, paidJobs, pendingJobs] = await Promise.all([
                Transaction.filter({ dasher_id: currentUser.id, type: 'payout' }),
                Job.filter({ awarded_dasher_id: currentUser.id, status: 'paid' }),
                Job.filter({ awarded_dasher_id: currentUser.id, status: 'completed' })
            ]);

            setTransactions(allTransactions);

            // Calculate earnings metrics
            const totalEarned = sumBy(allTransactions, 'payout_amount');
            const completedJobs = paidJobs.length;
            const avgPerJob = completedJobs > 0 ? totalEarned / completedJobs : 0;
            const pendingPayouts = sumBy(pendingJobs, 'final_amount') * 0.9; // Minus 10% platform fee

            // Calculate time-based earnings
            const now = new Date();
            const weekStart = startOfWeek(now);
            const monthStart = startOfMonth(now);

            const thisWeek = sumBy(
                allTransactions.filter(t => new Date(t.created_date) >= weekStart),
                'payout_amount'
            );
            const thisMonth = sumBy(
                allTransactions.filter(t => new Date(t.created_date) >= monthStart),
                'payout_amount'
            );

            setEarnings({
                totalEarned,
                thisWeek,
                thisMonth,
                completedJobs,
                avgPerJob,
                pendingPayouts
            });

            // Generate chart data based on time range
            generateChartData(allTransactions, parseInt(timeRange));

        } catch (error) {
            console.error('Error fetching earnings data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateChartData = (transactions, days) => {
        const endDate = new Date();
        const startDate = subDays(endDate, days);
        
        const dateRange = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dateRange.push(new Date(d));
        }

        const data = dateRange.map(date => {
            const dayTransactions = transactions.filter(t => 
                format(new Date(t.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
            return {
                date: format(date, 'MMM dd'),
                earnings: sumBy(dayTransactions, 'payout_amount'),
                jobs: dayTransactions.length
            };
        });

        setChartData(data);
    };

    const downloadEarningsReport = () => {
        const csvContent = [
            ['Date', 'Job Title', 'Amount', 'Platform Fee', 'Payout'],
            ...transactions.map(t => [
                format(new Date(t.created_date), 'yyyy-MM-dd'),
                'Job Payment', // In real app, you'd join with job data
                `$${t.amount.toFixed(2)}`,
                `$${t.platform_fee.toFixed(2)}`,
                `$${t.payout_amount.toFixed(2)}`
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `yardash_earnings_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading earnings data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Earnings Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${earnings.totalEarned.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">All time earnings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${earnings.thisWeek.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Weekly earnings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Per Job</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${earnings.avgPerJob.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{earnings.completedJobs} jobs completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Payouts Alert */}
            {earnings.pendingPayouts > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="font-semibold text-orange-800">Pending Payouts</p>
                                <p className="text-sm text-orange-700">
                                    ${earnings.pendingPayouts.toFixed(2)} from completed jobs awaiting client payment
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Charts and Analytics */}
            <Tabs defaultValue="earnings" className="space-y-4">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="earnings">Earnings Chart</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={downloadEarningsReport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                <TabsContent value="earnings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Earnings</CardTitle>
                            <CardDescription>Your earnings over the selected time period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']} />
                                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>Detailed record of all your payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {transactions.length > 0 ? transactions.map(transaction => (
                                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">Job Payment</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(transaction.created_date), 'MMM d, yyyy h:mm a')}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {transaction.payment_method_details}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">+${transaction.payout_amount.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">
                                                Total: ${transaction.amount.toFixed(2)} | Fee: ${transaction.platform_fee.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No transactions yet. Complete some jobs to start earning!
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
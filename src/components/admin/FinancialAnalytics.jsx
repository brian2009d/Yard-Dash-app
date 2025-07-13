import React, { useState, useEffect } from 'react';
import { Transaction } from '@/api/entities';
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, Briefcase, Download, CreditCard, AlertTriangle } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { groupBy, sumBy, countBy } from 'lodash';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancialAnalytics() {
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        totalPayouts: 0,
        platformFees: 0,
        transactionCount: 0,
        avgTransactionSize: 0,
        monthlyGrowth: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [timeRange, setTimeRange] = useState('30');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFinancialData();
    }, [timeRange]);

    const fetchFinancialData = async () => {
        try {
            const [allTransactions, allJobs, allUsers] = await Promise.all([
                Transaction.list('-created_date', 1000),
                Job.list('-created_date', 1000),
                User.list('', 1000)
            ]);

            setTransactions(allTransactions);

            // Calculate key metrics
            const totalRevenue = sumBy(allTransactions.filter(t => t.type === 'charge' && t.status === 'succeeded'), 'amount');
            const totalPayouts = sumBy(allTransactions.filter(t => t.type === 'payout' && t.status === 'succeeded'), 'payout_amount');
            const platformFees = sumBy(allTransactions.filter(t => t.status === 'succeeded'), 'platform_fee');
            const transactionCount = allTransactions.filter(t => t.status === 'succeeded').length;
            const avgTransactionSize = transactionCount > 0 ? totalRevenue / transactionCount : 0;

            // Calculate monthly growth
            const thisMonth = sumBy(
                allTransactions.filter(t => 
                    new Date(t.created_date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1) &&
                    t.type === 'charge' && t.status === 'succeeded'
                ), 
                'amount'
            );
            const lastMonth = sumBy(
                allTransactions.filter(t => {
                    const transactionDate = new Date(t.created_date);
                    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
                    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
                    return transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd &&
                           t.type === 'charge' && t.status === 'succeeded';
                }), 
                'amount'
            );
            const monthlyGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

            setMetrics({
                totalRevenue,
                totalPayouts,
                platformFees,
                transactionCount,
                avgTransactionSize,
                monthlyGrowth
            });

            // Generate chart data
            generateRevenueChart(allTransactions, parseInt(timeRange));
            generateCategoryChart(allJobs);

        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateRevenueChart = (transactions, days) => {
        const endDate = new Date();
        const startDate = subDays(endDate, days);
        
        const dateRange = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dateRange.push(new Date(d));
        }

        const data = dateRange.map(date => {
            const dayTransactions = transactions.filter(t => 
                format(new Date(t.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
                t.status === 'succeeded'
            );
            
            const revenue = sumBy(dayTransactions.filter(t => t.type === 'charge'), 'amount');
            const fees = sumBy(dayTransactions, 'platform_fee');
            const payouts = sumBy(dayTransactions.filter(t => t.type === 'payout'), 'payout_amount');
            
            return {
                date: format(date, 'MMM dd'),
                revenue,
                fees,
                payouts,
                transactions: dayTransactions.length
            };
        });

        setChartData(data);
    };

    const generateCategoryChart = (jobs) => {
        const paidJobs = jobs.filter(job => job.status === 'paid');
        const categoryRevenue = {};
        
        paidJobs.forEach(job => {
            const category = job.category.replace('_', ' ');
            if (!categoryRevenue[category]) {
                categoryRevenue[category] = 0;
            }
            categoryRevenue[category] += job.final_amount || job.budget;
        });

        const data = Object.entries(categoryRevenue).map(([category, revenue], index) => ({
            name: category,
            value: revenue,
            color: COLORS[index % COLORS.length]
        }));

        setCategoryData(data);
    };

    const downloadFinancialReport = () => {
        const csvContent = [
            ['Date', 'Type', 'Amount', 'Platform Fee', 'Status', 'Payment Method'],
            ...transactions.map(t => [
                format(new Date(t.created_date), 'yyyy-MM-dd HH:mm:ss'),
                t.type,
                `$${t.amount.toFixed(2)}`,
                `$${t.platform_fee.toFixed(2)}`,
                t.status,
                t.payment_method_details || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `yardash_financial_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading financial analytics...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">All time processed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.platformFees.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.monthlyGrowth >= 0 ? '+' : ''}{metrics.monthlyGrowth.toFixed(1)}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.totalPayouts.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Paid to Dashers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.avgTransactionSize.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{metrics.transactionCount} transactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Analytics */}
            <Tabs defaultValue="revenue" className="space-y-4">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
                        <TabsTrigger value="categories">Category Analysis</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction Log</TabsTrigger>
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
                        <Button variant="outline" onClick={downloadFinancialReport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                <TabsContent value="revenue">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Revenue</CardTitle>
                                <CardDescription>Platform revenue and fees over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`]} />
                                        <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
                                        <Line type="monotone" dataKey="fees" stroke="#3b82f6" name="Platform Fees" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Volume</CardTitle>
                                <CardDescription>Number of transactions per day</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="transactions" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="categories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Category</CardTitle>
                            <CardDescription>Which job categories generate the most revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                <ResponsiveContainer width="100%" height={300} className="lg:w-1/2">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2 lg:w-1/2">
                                    {categoryData.map((category, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                                                <span className="capitalize">{category.name}</span>
                                            </div>
                                            <span className="font-semibold">${category.value.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Detailed transaction log with status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {transactions.slice(0, 50).map(transaction => (
                                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                                transaction.status === 'succeeded' ? 'bg-green-500' :
                                                transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}></div>
                                            <div>
                                                <p className="font-medium capitalize">{transaction.type}</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(transaction.created_date), 'MMM d, yyyy h:mm a')}
                                                </p>
                                                <p className="text-xs text-gray-400">{transaction.payment_method_details}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${transaction.amount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Fee: ${transaction.platform_fee.toFixed(2)}</p>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                transaction.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
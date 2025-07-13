import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, User as UserIcon, Briefcase, DollarSign, ShieldCheck, ShieldX } from 'lucide-react';
import { format } from 'date-fns';

export default function DisputeResolution() {
    const [disputedJobs, setDisputedJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const [jobs, allUsers] = await Promise.all([
                Job.filter({ status: 'disputed' }),
                User.list('', 1000)
            ]);
            setDisputedJobs(jobs);
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch disputes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getUser = (userId) => users.find(u => u.id === userId);

    const handleRefundClient = async (job) => {
        const client = getUser(job.client_id);
        const dasher = getUser(job.awarded_dasher_id);

        if (!client || !dasher) {
            console.error("Could not find client or dasher for the job.");
            return;
        }

        const platformFee = job.final_amount * 0.10;

        await Transaction.create({
            job_id: job.id,
            client_id: client.id,
            dasher_id: dasher.id,
            amount: job.final_amount,
            platform_fee: platformFee,
            payout_amount: 0,
            type: 'refund',
            status: 'succeeded',
            stripe_transaction_id: `re_sim_admin_${new Date().getTime()}`,
            payment_method_details: `Refund approved by admin for disputed job.`
        });

        await Job.update(job.id, { status: 'refunded' });
        fetchDisputes(); // Refresh the list
    };

    const handlePayDasher = async (job) => {
        const client = getUser(job.client_id);
        const dasher = getUser(job.awarded_dasher_id);

        if (!client || !dasher) {
            console.error("Could not find client or dasher for the job.");
            return;
        }

        const platformFee = job.final_amount * 0.10;
        const payoutAmount = job.final_amount - platformFee;

        const chargeTransaction = await Transaction.create({
            job_id: job.id,
            client_id: client.id,
            dasher_id: dasher.id,
            amount: job.final_amount,
            platform_fee: platformFee,
            payout_amount: payoutAmount,
            type: 'charge',
            status: 'succeeded',
            stripe_transaction_id: `ch_sim_admin_${new Date().getTime()}`,
            payment_method_details: `Admin override for disputed job.`
        });

        await Job.update(job.id, {
            status: 'paid',
            paid_at: new Date().toISOString(),
            transaction_id: chargeTransaction.id,
            platform_fee: platformFee,
            payout_amount: payoutAmount
        });

        await Transaction.create({
            job_id: job.id,
            client_id: client.id,
            dasher_id: dasher.id,
            amount: job.final_amount,
            platform_fee: platformFee,
            payout_amount: payoutAmount,
            type: 'payout',
            status: 'succeeded',
            stripe_transaction_id: `po_sim_admin_${new Date().getTime()}`,
            payment_method_details: `Payout for disputed job approved by admin.`
        });

        fetchDisputes(); // Refresh the list
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading disputes...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dispute Resolution Center</CardTitle>
                <CardDescription>Manage and resolve jobs that have been disputed by clients.</CardDescription>
            </CardHeader>
            <CardContent>
                {disputedJobs.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <ShieldCheck className="w-12 h-12 mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold">No Active Disputes</h3>
                        <p className="text-gray-500">All jobs are currently in good standing.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputedJobs.map(job => {
                            const client = getUser(job.client_id);
                            const dasher = getUser(job.awarded_dasher_id);
                            return (
                                <div key={job.id} className="p-4 border rounded-lg">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-grow space-y-3">
                                            <h4 className="font-semibold text-lg">{job.title}</h4>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p className="flex items-center gap-2"><Briefcase className="w-4 h-4" />Job ID: {job.id.substring(0,8)}</p>
                                                <p className="flex items-center gap-2"><UserIcon className="w-4 h-4" />Client: {client?.full_name || 'N/A'}</p>
                                                <p className="flex items-center gap-2"><UserIcon className="w-4 h-4" />Dasher: {dasher?.full_name || 'N/A'}</p>
                                                <p className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Amount: ${job.final_amount?.toFixed(2)}</p>
                                            </div>
                                            <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Dispute Reason</AlertTitle>
                                                <AlertDescription>{job.dispute_reason}</AlertDescription>
                                            </Alert>
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col gap-3 justify-center">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                        Resolve for Dasher (Pay)
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Pay the Dasher?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will override the client's dispute and transfer ${job.final_amount?.toFixed(2)} to the Dasher. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handlePayDasher(job)} className="bg-green-600 hover:bg-green-700">Confirm Payment</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive">
                                                        <ShieldX className="w-4 h-4 mr-2" />
                                                        Resolve for Client (Refund)
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Refund the Client?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will issue a full refund of ${job.final_amount?.toFixed(2)} to the client and cancel the Dasher's payout. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRefundClient(job)} className="bg-red-600 hover:bg-red-700">Confirm Refund</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
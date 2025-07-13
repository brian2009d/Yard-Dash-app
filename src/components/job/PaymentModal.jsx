import React, { useState } from 'react';
import { Job } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { User } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ShieldCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee

export default function PaymentModal({ job, client, isOpen, onClose, onPaymentSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending | success | error

    const finalAmount = job.final_amount || job.budget;
    const platformFee = finalAmount * PLATFORM_FEE_PERCENTAGE;
    const payoutAmount = finalAmount - platformFee;
    const totalCharge = finalAmount;

    const handlePayment = async () => {
        setIsProcessing(true);
        
        // Simulate API call to payment provider
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const updatedJob = {
                ...job,
                status: 'paid',
                paid_at: new Date().toISOString(),
                platform_fee: platformFee,
                payout_amount: payoutAmount,
                transaction_id: `txn_sim_${Date.now()}`
            };
            
            await Job.update(job.id, updatedJob);

            await Transaction.create({
                job_id: job.id,
                client_id: client.id,
                dasher_id: job.awarded_dasher_id,
                amount: totalCharge,
                platform_fee: platformFee,
                payout_amount: payoutAmount,
                type: 'charge',
                status: 'succeeded',
                stripe_transaction_id: updatedJob.transaction_id,
                payment_method_details: `${client.client_payment_info.brand} ending in ${client.client_payment_info.last_4}`
            });

            setPaymentStatus('success');
            setTimeout(() => {
                onPaymentSuccess(updatedJob);
            }, 1500);

        } catch (error) {
            console.error('Payment failed:', error);
            setPaymentStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                {paymentStatus === 'success' ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                        <DialogTitle className="text-2xl">Payment Successful!</DialogTitle>
                        <DialogDescription>The Dasher has been paid.</DialogDescription>
                    </div>
                ) : paymentStatus === 'error' ? (
                    <div className="text-center py-8">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                        <DialogTitle className="text-2xl">Payment Failed</DialogTitle>
                        <DialogDescription>Something went wrong. Please try again.</DialogDescription>
                        <Button onClick={() => setPaymentStatus('pending')} className="mt-4">Try Again</Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Complete Payment</DialogTitle>
                            <DialogDescription>Confirm payment for "{job.title}".</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 my-4">
                            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm"><span>Job Cost</span><span>${finalAmount.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm text-gray-500"><span>Platform Fee (10%)</span><span>+ ${platformFee.toFixed(2)}</span></div>
                                <Separator/>
                                <div className="flex justify-between font-bold"><span>Total Charged</span><span>${totalCharge.toFixed(2)}</span></div>
                            </div>
                            <div className="flex items-center gap-4 p-3 border rounded-lg">
                                <CreditCard className="w-6 h-6 text-gray-600"/>
                                <div>
                                    <p className="font-medium">{client?.client_payment_info?.brand} ending in {client?.client_payment_info?.last_4}</p>
                                    <p className="text-xs text-gray-500">This is your saved payment method.</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex-col gap-2">
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePayment} disabled={isProcessing}>
                                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Processing...</> : `Pay $${totalCharge.toFixed(2)}`}
                            </Button>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <ShieldCheck className="w-4 h-4"/>
                                <span>Secure payments by Yardash</span>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
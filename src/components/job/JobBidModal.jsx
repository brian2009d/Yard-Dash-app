
import React, { useState, useEffect } from 'react';
import { Bid } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, DollarSign, User as UserIcon, Phone, MessageSquare, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function JobBidModal({ job, isOpen, onClose }) {
  const [client, setClient] = useState(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [bidAmount, setBidAmount] = useState(job.budget || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // form | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (job?.client_id) {
      const fetchClient = async () => {
        setIsLoadingClient(true);
        try {
          const clientData = await UserEntity.get(job.client_id);
          setClient(clientData);
        } catch (err) {
          console.error("Failed to fetch client data", err);
        } finally {
          setIsLoadingClient(false);
        }
      };
      fetchClient();
    }
  }, [job]);

  const handleBidSubmit = async () => {
    if (!bidAmount || bidAmount <= 0) {
        setError('Please enter a valid bid amount.');
        return;
    }
    setError('');
    setIsSubmitting(true);
    try {
        const dasher = await UserEntity.me();
        await Bid.create({
            job_id: job.id,
            dasher_id: dasher.id,
            amount: parseFloat(bidAmount),
            message: message,
        });
        setStep('success');
    } catch (err) {
        console.error("Failed to place bid", err);
        setError('There was an error placing your bid. Please try again.');
        setStep('error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setClient(null);
    onClose();
  };
  
  const ClientInfo = () => {
      if (isLoadingClient) {
          return (
              <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
              </div>
          )
      }
      if (!client) {
          return <p className="text-sm text-red-500">Could not load client information.</p>
      }
      return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{client.full_name}</span>
            </div>
            <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{client.phone_number || 'Phone not provided'}</span>
            </div>
          </div>
      )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
            {step === 'form' && (
                <>
                    <DialogHeader>
                        <DialogTitle className="text-xl">{job.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 pt-1">
                            <MapPin className="w-4 h-4" /> {job.city}, {job.state} {job.zip_code}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
                        <p className="text-sm text-gray-600">{job.description}</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="capitalize">{job.category.replace('_', ' ')}</Badge>
                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                <span>Budget: ${job.budget}</span>
                            </div>
                        </div>
                        
                        {job.special_instructions && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    Special Instructions
                                </h4>
                                <p className="text-sm text-gray-700">{job.special_instructions}</p>
                            </div>
                        )}
                        
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Client Information</h4>
                            <ClientInfo />
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Place Your Bid</h4>
                            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                            <div className="space-y-1">
                                <label htmlFor="bidAmount" className="text-xs font-medium">Your Bid ($)</label>
                                <Input id="bidAmount" type="number" placeholder="e.g., 45" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="message" className="text-xs font-medium">Message (Optional)</label>
                                <Textarea id="message" placeholder="Introduce yourself, ask a question..." value={message} onChange={e => setMessage(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleBidSubmit} disabled={isSubmitting}>{isSubmitting ? 'Placing Bid...' : 'Place Bid'}</Button>
                    </DialogFooter>
                </>
            )}
            {step === 'success' && (
                <div className="py-8 text-center flex flex-col items-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold">Bid Placed Successfully!</h3>
                    <p className="text-gray-600 mt-2 mb-6">The client will be notified of your bid.</p>
                    <Button onClick={handleClose} className="w-full">Done</Button>
                </div>
            )}
            {step === 'error' && (
                <div className="py-8 text-center flex flex-col items-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold">Something Went Wrong</h3>
                    <p className="text-gray-600 mt-2 mb-6">{error}</p>
                    <Button onClick={() => setStep('form')} className="w-full">Try Again</Button>
                </div>
            )}
        </DialogContent>
    </Dialog>
  );
}

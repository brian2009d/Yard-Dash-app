
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, DollarSign, Clock, User, MessageSquare, CreditCard, Navigation } from 'lucide-react';
import { Job } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';

export default function JobAcceptanceFlow({ job, onClose, onJobAccepted }) {
  const [step, setStep] = useState('details'); // details -> confirm -> accepted
  const [bidAmount, setBidAmount] = useState(job.budget);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcceptJob = async () => {
    setIsSubmitting(true);
    try {
      const user = await UserEntity.me();
      await Job.update(job.id, {
        status: 'accepted',
        awarded_dasher_id: user.id,
        accepted_at: new Date().toISOString(),
        final_amount: bidAmount,
        payment_method: paymentMethod
      });
      
      setStep('accepted');
      onJobAccepted && onJobAccepted(job);
    } catch (error) {
      console.error('Error accepting job:', error);
    }
    setIsSubmitting(false);
  };

  const openGPSNavigation = () => {
    const address = encodeURIComponent(`${job.street_address}, ${job.city}, ${job.state} ${job.zip_code}`);
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, try to open native GPS app
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // iOS - try Apple Maps first, then Google Maps
        window.location.href = `maps://maps.apple.com/?daddr=${address}`;
        setTimeout(() => {
          // Fallback to Google Maps web if Apple Maps doesn't open
          window.location.href = `https://maps.google.com/maps?daddr=${address}`;
        }, 1000); // Small delay to allow native app to try first
      } else {
        // Android - try Google Maps app scheme
        window.location.href = `google.navigation:q=${address}`;
        setTimeout(() => {
          // Fallback to Google Maps web if app scheme doesn't open
          window.location.href = `https://maps.google.com/maps?daddr=${address}`;
        }, 1000); // Small delay to allow native app to try first
      }
    } else {
      // For desktop, open Google Maps in new tab
      window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank');
    }
  };

  if (step === 'accepted') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Job Accepted!</h3>
          <p className="text-gray-600 mb-4">
            You've successfully accepted this job. The client will be notified.
          </p>
          
          {/* Job Details with Contact Info */}
          <div className="space-y-2 text-sm text-left bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between">
              <span>Job:</span>
              <span className="font-medium">{job.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">${bidAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-medium capitalize">{paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Address:</span>
              <span className="font-medium text-right">{`${job.street_address}, ${job.city}, ${job.state}`}</span>
            </div>
            {job.client_phone && (
              <div className="flex justify-between items-center">
                <span>Phone:</span>
                <a href={`tel:${job.client_phone}`} className="font-medium text-blue-600 hover:underline">
                  {job.client_phone}
                </a>
              </div>
            )}
            {job.special_instructions && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs font-medium text-yellow-800 mb-1">Special Instructions:</p>
                <p className="text-xs text-yellow-700">{job.special_instructions}</p>
              </div>
            )}
          </div>

          {/* GPS Navigation Button */}
          <Button 
            onClick={openGPSNavigation}
            className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>

          <Button onClick={onClose} variant="outline" className="w-full">
            Got it
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Accept Job
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Details */}
        <div className="space-y-3">
          <h3 className="font-semibold">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{job.city}, {job.state}</span>
            </div>
            <Badge variant="secondary">
              {job.category.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <Separator />

        {step === 'details' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Bid Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                  className="pl-10"
                  placeholder="Enter your price"
                />
              </div>
              <p className="text-xs text-gray-500">
                Client's budget: ${job.budget}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message to Client (Optional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let them know why you're the right person for this job..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => setStep('confirm')} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Job Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Your bid:</span>
                  <span className="font-medium">${bidAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment method:</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
                {job.estimated_square_feet && (
                  <div className="flex justify-between">
                    <span>Property size:</span>
                    <span>~{job.estimated_square_feet.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <p>• You'll be committed to completing this job</p>
              <p>• Payment will be handled directly with the client</p>
              <p>• Both parties can rate each other after completion</p>
              <p>• Address details will be provided after acceptance</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('details')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleAcceptJob}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Accepting...' : 'Accept Job'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

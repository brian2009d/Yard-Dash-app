
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, MapPin, User, AlertTriangle, DollarSign, Star, Navigation } from 'lucide-react';
import { Job } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { Review } from '@/api/entities';
import { format } from 'date-fns';
import LeaveReviewForm from './LeaveReviewForm';
import { Textarea } from '@/components/ui/textarea';
import PaymentModal from './PaymentModal'; // Import the new modal

const StatusBadge = ({ status }) => {
  const statusConfig = {
    accepted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    payment_pending: { color: 'bg-orange-100 text-orange-800', icon: DollarSign },
    paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    disputed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  };

  const config = statusConfig[status] || statusConfig.accepted;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1 border`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ')}
    </Badge>
  );
};

export default function JobTracker({ job, userType, onJobUpdate }) {
  const [currentJob, setCurrentJob] = useState(job);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientUser, setClientUser] = useState(null);

  useEffect(() => {
    const checkIfReviewed = async () => {
        if (currentJob.status === 'paid' && userType === 'client') {
            try {
                const currentUser = await UserEntity.me();
                const existingReview = await Review.filter({ job_id: currentJob.id, reviewer_id: currentUser.id });
                if (existingReview && existingReview.length > 0) {
                    setHasReviewed(true);
                } else {
                    setHasReviewed(false);
                }
            } catch (error) {
                console.error('Error checking for existing review:', error);
                setHasReviewed(false);
            }
        } else {
            setHasReviewed(false);
        }
    };
    checkIfReviewed();

    if (userType === 'client') {
        const fetchClient = async () => {
            try {
                const user = await UserEntity.me();
                setClientUser(user);
            } catch (error) {
                console.error('Error fetching client user:', error);
            }
        };
        fetchClient();
    }
  }, [currentJob.id, currentJob.status, userType]);

  const handleStatusUpdate = async (newStatus, additionalData = {}) => {
    setIsUpdating(true);
    try {
      const updateData = { status: newStatus, ...additionalData };
      
      if (newStatus === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      await Job.update(currentJob.id, updateData);
      const updatedJob = { ...currentJob, ...updateData };
      setCurrentJob(updatedJob);
      onJobUpdate && onJobUpdate(updatedJob);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
    setIsUpdating(false);
  };
  
  const handlePaymentSuccess = (updatedJob) => {
    setIsPaymentModalOpen(false);
    setCurrentJob(updatedJob);
    onJobUpdate && onJobUpdate(updatedJob);
  };

  const handleReviewSubmitted = () => {
    setHasReviewed(true);
  }

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    await handleStatusUpdate('disputed', { dispute_reason: disputeReason });
    setShowDispute(false);
    setDisputeReason('');
  };

  const openGPSNavigation = () => {
    const address = encodeURIComponent(`${currentJob.street_address}, ${currentJob.city}, ${currentJob.state} ${currentJob.zip_code}`);
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, try to open native GPS app
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // iOS - try Apple Maps first, then Google Maps
        window.location.href = `maps://maps.apple.com/?daddr=${address}`;
        setTimeout(() => {
          // Fallback to Google Maps if Apple Maps doesn't open
          window.location.href = `https://maps.google.com/maps?daddr=${address}`;
        }, 1000);
      } else {
        // Android - try Google Maps app
        window.location.href = `google.navigation:q=${address}`;
        setTimeout(() => {
          // Fallback to Google Maps web if native app doesn't open
          window.location.href = `https://maps.google.com/maps?daddr=${address}`;
        }, 1000);
      }
    } else {
      // For desktop, open Google Maps in new tab
      window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank');
    }
  };

  const renderDasherActions = () => {
    switch (currentJob.status) {
      case 'accepted':
        return (
          <div className="space-y-3">
            <Button 
              onClick={openGPSNavigation}
              variant="outline"
              className="w-full"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isUpdating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? 'Starting...' : 'Start Job'}
            </Button>
          </div>
        );
      case 'in_progress':
        return (
          <div className="space-y-3">
             <Button 
              onClick={openGPSNavigation}
              variant="outline"
              className="w-full"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? 'Completing...' : 'Mark as Completed'}
            </Button>
          </div>
        );
      case 'completed':
        return (
          <div className="text-center text-green-600">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Job Completed!</p>
            <p className="text-sm text-gray-500">Waiting for client confirmation and payment</p>
          </div>
        );
      case 'paid':
        return (
             <div className="text-center text-green-600 space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto" />
                <p className="font-medium">Job Paid!</p>
                <p className="text-sm text-gray-700">You received a payout of <span className="font-bold">${currentJob.payout_amount?.toFixed(2)}</span></p>
            </div>
        )
      default:
        return null;
    }
  };

  const renderClientActions = () => {
    switch (currentJob.status) {
      case 'completed':
        return (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600">
              The dasher has marked this job as completed. Please review and proceed to payment.
            </p>
            {showDispute ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Please describe the issue with the work..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowDispute(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDispute}
                    variant="destructive"
                    className="flex-1"
                    disabled={!disputeReason.trim() || isUpdating}
                  >
                    {isUpdating ? 'Submitting...' : 'Submit Dispute'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowDispute(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Dispute Work
                </Button>
                <Button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!clientUser?.client_payment_info?.last_4}
                >
                  Accept & Pay
                </Button>
              </div>
            )}
             {!clientUser?.client_payment_info?.last_4 && (
                <CardDescription className="text-center text-xs text-red-600 pt-2">Please add a payment method in your profile to pay.</CardDescription>
            )}
          </div>
        );
      case 'disputed':
        return (
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Job Disputed</p>
            <p className="text-sm text-gray-600">
              Reason: {currentJob.dispute_reason}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              A Yardash representative will contact you shortly.
            </p>
          </div>
        );
      case 'paid':
        if (hasReviewed) {
          return (
            <div className="text-center text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">Review Submitted!</p>
            </div>
          );
        }
        return <LeaveReviewForm job={currentJob} onReviewSubmitted={handleReviewSubmitted} />;
      default:
        return null;
    }
  };

  return (
    <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentJob.title}</CardTitle>
              <StatusBadge status={currentJob.status} />
            </div>
             <CardDescription>
                Job ID: {currentJob.id.substring(0, 8)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{currentJob.city}, {currentJob.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>${currentJob.final_amount || currentJob.budget}</span>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Progress</h4>
              <div className="space-y-2 text-xs">
                {currentJob.accepted_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Accepted on {format(new Date(currentJob.accepted_at), 'MMM d, h:mm a')}</span>
                  </div>
                )}
                {currentJob.started_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Started on {format(new Date(currentJob.started_at), 'MMM d, h:mm a')}</span>
                  </div>
                )}
                {currentJob.completed_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Completed on {format(new Date(currentJob.completed_at), 'MMM d, h:mm a')}</span>
                  </div>
                )}
                {currentJob.paid_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Paid on {format(new Date(currentJob.paid_at), 'MMM d, h:mm a')}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions based on user type */}
            {userType === 'dasher' && renderDasherActions()}
            {userType === 'client' && renderClientActions()}
          </CardContent>
        </Card>
        {clientUser && (
            <PaymentModal
                job={currentJob}
                client={clientUser}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        )}
    </>
  );
}

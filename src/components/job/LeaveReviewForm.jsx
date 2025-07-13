import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Review } from '@/api/entities';
import { User } from '@/api/entities';

export default function LeaveReviewForm({ job, onReviewSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            const currentUser = await User.me();
            // Create the review
            await Review.create({
                job_id: job.id,
                reviewer_id: currentUser.id,
                reviewee_id: job.awarded_dasher_id,
                rating: rating,
                comment: comment,
            });

            // Update dasher's average rating
            const dasherReviews = await Review.filter({ reviewee_id: job.awarded_dasher_id });
            const totalRating = dasherReviews.reduce((acc, r) => acc + r.rating, 0);
            const averageRating = totalRating / dasherReviews.length;
            await User.update(job.awarded_dasher_id, { average_rating: parseFloat(averageRating.toFixed(2)) });
            
            onReviewSubmitted();
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
            <h4 className="font-medium">Leave a Review</h4>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`cursor-pointer w-6 h-6 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setRating(star)}
                    />
                ))}
            </div>
            <Textarea 
                placeholder="Share your experience with the dasher..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
            />
            <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || rating === 0}
                className="w-full bg-green-600 hover:bg-green-700"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
        </div>
    );
}
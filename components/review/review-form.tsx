// components/review/review-form.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchWithAuth } from '@/lib/auth-utils';

interface ReviewFormProps {
  bookingId?: string;
  itemId?: string;
  revieweeId?: string;
  type: 'item' | 'user';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ 
  bookingId, 
  itemId, 
  revieweeId, 
  type, 
  onSuccess, 
  onCancel 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const body: any = { rating, comment };
      
      if (type === 'item' && itemId) {
        body.item = itemId;
      } else if (type === 'user' && revieweeId) {
        body.reviewee = revieweeId;
      }

      const res = await fetchWithAuth('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-500">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">DONE</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Review Submitted!</h3>
          <p className="text-gray-600">Thank you for your feedback.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === 'item' ? 'Review Item & Owner' : 'Review Renter'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Star Rating */}
          <div>
            <Label>Rating *</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">
              Comment (Optional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                type === 'item' 
                  ? "Share your experience with this item and the owner..."
                  : "Share your experience with this renter..."
              }
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            {onCancel && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
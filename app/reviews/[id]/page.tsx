// app/reviews/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { X, Star, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useItemReviews, useCanReview, useReviewActions } from '@/hooks/use-reviews';
import { getUserId } from '@/lib/auth-utils';

export default function ItemReviewsPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const { reviews, setReviews, loading: reviewsLoading } = useItemReviews(itemId);
  const { canReview, existingReview, loading: canReviewLoading } = useCanReview(itemId);
  const { submitReview, updateReview, deleteReview, loading: actionLoading, error } = useReviewActions();
  
  const currentUserId = getUserId();

  // Pre-fill form if editing
  useEffect(() => {
    if (existingReview && isEditing) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setShowForm(true);
    }
  }, [existingReview, isEditing]);

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    let result;
    if (isEditing && existingReview) {
      result = await updateReview(existingReview._id, rating, comment);
    } else {
      result = await submitReview(itemId, rating, comment);
    }

    if (result) {
      // Update reviews list
      if (isEditing && existingReview) {
        setReviews(prev => prev.map(r => r._id === existingReview._id ? result! : r));
      } else {
        setReviews(prev => [result!, ...prev]);
      }
      
      // Reset form
      setRating(0);
      setComment('');
      setShowForm(false);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    
    const success = await deleteReview(existingReview._id);
    if (success) {
      setReviews(prev => prev.filter(r => r._id !== existingReview._id));
      setIsEditing(false);
      setShowForm(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowForm(false);
    setRating(0);
    setComment('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'text-3xl' : 'text-base';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass === 'text-3xl' ? 'w-8 h-8' : 'w-4 h-4'} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="min-h-screen w-full flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Item Reviews
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Review Form */}
            {canReview && (
              <Card className="border-2 border-blue-100 shadow-md">
                <CardContent className="p-6">
                  {!showForm && !existingReview && (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  )}

                  {!showForm && existingReview && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">Your Review</h3>
                          <p className="text-sm text-gray-500">Posted on {formatDate(existingReview.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            disabled={actionLoading}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={actionLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {renderStars(existingReview.rating, 'lg')}
                        {existingReview.comment && (
                          <p className="text-gray-700 mt-3 p-4 bg-gray-50 rounded-lg">
                            {existingReview.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {showForm && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold mb-3">
                          Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className="transition-all duration-200 hover:scale-110"
                            >
                              <Star
                                className={`w-10 h-10 ${
                                  star <= (hoveredRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {rating > 0 && (
                          <p className="text-sm text-gray-600 mt-2 font-medium">
                            {rating === 1 && '⭐ Poor'}
                            {rating === 2 && '⭐⭐ Fair'}
                            {rating === 3 && '⭐⭐⭐ Good'}
                            {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                            {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="comment" className="block text-sm font-semibold mb-2">
                          Your Review (Optional)
                        </label>
                        <Textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your experience with this item..."
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={rating === 0 || actionLoading}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {actionLoading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
                        </Button>
                        {(isEditing || showForm) && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={actionLoading}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {!canReview && !canReviewLoading && (
              <Card className="border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    You need to rent this item before you can leave a review
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Customer Reviews
              </h3>

              {reviewsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No reviews yet</p>
                    <p className="text-sm text-gray-400 mt-2">Be the first to review this item!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const isOwnReview = review.reviewer._id === currentUserId;
                    
                    return (
                      <Card
                        key={review._id}
                        className={`transition-all hover:shadow-lg ${
                          isOwnReview ? 'border-2 border-blue-200 bg-blue-50/50' : ''
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {review.reviewer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {review.reviewer.name}
                                    {isOwnReview && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        You
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(review.createdAt)}
                                  </p>
                                </div>
                              </div>
                              {renderStars(review.rating)}
                            </div>
                          </div>

                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          )}

                          {review.updatedAt !== review.createdAt && (
                            <p className="text-xs text-gray-400 mt-3 italic">
                              Edited on {formatDate(review.updatedAt)}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
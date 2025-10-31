// hooks/use-reviews.ts
import { useState, useEffect } from 'react';
import { fetchWithAuth, getUserId } from '@/lib/auth-utils';

export interface Review {
  _id: string;
  reviewer: {
    _id: string;
    name: string;
    email: string;
  };
  reviewee: {
    _id: string;
    name: string;
    email: string;
  };
  item: {
    _id: string;
    title: string;
    imageUrl: string;
    category: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Fetch reviews for an item
export function useItemReviews(itemId: string | null) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!itemId) {
      setReviews([]);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetch(`/api/reviews?item=${itemId}`);
        
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          const errorData = await res.json();
          setError(errorData.error || "Failed to fetch reviews");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch reviews");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [itemId]);

  return { reviews, setReviews, loading, error };
}

// Check if user can review (has completed booking)
export function useCanReview(itemId: string | null) {
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) return;

    const checkReviewStatus = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        if (!userId) return;

        // Fetch user's reviews for this item
        const res = await fetchWithAuth(`/api/reviews?item=${itemId}`);
        
        if (res.ok) {
          const reviews = await res.json();
          const userReview = reviews.find((r: Review) => r.reviewer._id === userId);
          
          if (userReview) {
            setExistingReview(userReview);
            setCanReview(true); // Can edit existing review
          } else {
            // Check if user has a paid booking for this item
            const bookingsRes = await fetchWithAuth('/api/bookings');
            if (bookingsRes.ok) {
              const bookings = await bookingsRes.json();
              const hasPaidBooking = bookings.some(
                (b: any) => b.item._id === itemId && b.status === 'paid'
              );
              setCanReview(hasPaidBooking);
            }
          }
        }
      } catch (err) {
        console.error("Error checking review status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkReviewStatus();
  }, [itemId]);

  return { canReview, existingReview, loading };
}

// Review actions
export function useReviewActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const submitReview = async (itemId: string, rating: number, comment: string): Promise<Review | null> => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ item: itemId, rating, comment }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.review;
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to submit review");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment: string): Promise<Review | null> => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update review");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to update review");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return false;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        return true;
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to delete review");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete review");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitReview, updateReview, deleteReview, loading, error };
}
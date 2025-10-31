// components/review/review-display.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserId } from '@/lib/auth-utils';

interface Review {
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
}

interface ReviewDisplayProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  showItem?: boolean;
}

export default function ReviewDisplay({ 
  review, 
  onEdit, 
  onDelete, 
  showItem = false 
}: ReviewDisplayProps) {
  const currentUserId = getUserId();
  const isReviewer = currentUserId === review.reviewer._id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-500">
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <p className="font-semibold">{review.reviewer.name}</p>
                <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            {renderStars(review.rating)}
          </div>
          
          {isReviewer && (onEdit || onDelete) && (
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onEdit}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {showItem && (
          <div className="flex gap-3 mb-3 p-2 bg-gray-50 rounded">
            <img 
              src={review.item.imageUrl} 
              alt={review.item.title}
              className="w-16 h-16 object-cover rounded"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.jpg';
              }}
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{review.item.title}</p>
              <p className="text-xs text-gray-500 capitalize">{review.item.category}</p>
            </div>
          </div>
        )}

        {review.comment && (
          <p className="text-gray-700 mt-2">{review.comment}</p>
        )}

        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          Review for: {review.reviewee.name}
        </div>
      </CardContent>
    </Card>
  );
}
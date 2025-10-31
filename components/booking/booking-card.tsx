// components/booking/booking-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/hooks/use-bookings";
import { getUserId } from "@/lib/auth-utils";

interface BookingCardProps {
  booking: Booking;
  onConfirm?: () => void;
  onRequestPayment?: () => void;
  onPayNow?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  loading?: boolean;
}

export default function BookingCard({
  booking,
  onConfirm,
  onRequestPayment,
  onPayNow,
  onCancel,
  onDelete,
  onViewDetails,
  loading = false
}: BookingCardProps) {
  const currentUserId = getUserId();
  
  // Determine if current user is owner or renter
  const itemOwnerId = booking.item?.owner
    ? (typeof booking.item.owner === 'object' && booking.item.owner !== null
        ? booking.item.owner._id
        : booking.item.owner)
    : null;
  const isOwner = currentUserId === itemOwnerId;
  const isRenter = currentUserId === booking.renter._id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending payment': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{booking.item?.title ?? 'Item removed'}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {isOwner ? `Renter: ${booking.renter.name}` : 'Your Booking'}
            </p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4">
          <img 
            src={booking.item?.imageUrl ?? '/placeholder-image.jpg'} 
            alt={booking.item?.title ?? 'Item image'}
            className="w-24 h-24 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.jpg';
            }}
          />
          <div className="flex-1 text-sm space-y-1">
            <p><strong>Dates:</strong> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
            <p><strong>Total:</strong> ${booking.totalPrice.toFixed(2)}</p>
            <p><strong>Category:</strong> {booking.item?.category ?? '—'}</p>
            {booking.cancellationReason && (
              <p className="text-red-600">
                <strong>Cancelled:</strong> {booking.cancellationReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          )}

          {/* Owner: Confirm pending booking */}
          {isOwner && booking.status === 'pending' && onConfirm && (
            <Button 
              size="sm"
              onClick={onConfirm}
              disabled={loading}
            >
              Confirm Booking
            </Button>
          )}

          {/* Owner: Request payment after confirmation */}
          {isOwner && booking.status === 'confirmed' && onRequestPayment && (
            <Button 
              size="sm"
              variant="default"
              onClick={onRequestPayment}
              disabled={loading}
            >
              Request Payment
            </Button>
          )}

          {/* Renter: Pay now button */}
          {isRenter && booking.status === 'pending payment' && onPayNow && (
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={onPayNow}
              disabled={loading}
            >
              Pay ${booking.totalPrice.toFixed(2)}
            </Button>
          )}

          {/* Cancellation - both can cancel (but not if paid) */}
          {(isOwner || isRenter) && 
           ['pending', 'confirmed', 'pending payment'].includes(booking.status) && 
           onCancel && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}

          {/* Delete - renter only for pending */}
          {isRenter && booking.status === 'pending' && onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDelete}
              disabled={loading}
              className="text-red-600"
            >
              Delete
            </Button>
          )}

          {/* Paid status indicator */}
          {booking.status === 'paid' && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
              Payment Completed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
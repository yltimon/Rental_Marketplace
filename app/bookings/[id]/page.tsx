// app/bookings/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useBooking } from '@/hooks/use-bookings';
import { useBookingActions } from '@/hooks/use-booking-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserId, getUserRole } from '@/lib/auth-utils';

export default function BookingDetailPage() {

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;
  const paymentSuccess = searchParams.get('payment') === 'success';
  
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  
  const { booking, setBooking, loading, error } = useBooking(bookingId);
  const { confirmBooking, onRequestPayment, onPayNow ,cancelBooking, deleteBooking, loading: actionLoading, error: actionError } = useBookingActions(bookingId);

  const currentUserId = getUserId();
  const userRole = getUserRole();

  const handleConfirm = async () => {
    const updated = await confirmBooking();
    if (updated) setBooking(updated);
  };

  const handleSetPendingPayment = async () => {
    const updated = await onRequestPayment();
    if (updated) setBooking(updated);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
    setCancellationReason('');
  };

  const handleCancelSubmit = async () => {
    const updated = await cancelBooking(cancellationReason);
    if (updated) {
      setBooking(updated);
      setShowCancelDialog(false);
      setCancellationReason('');
    }
  };

  const handleDelete = async () => {
    const success = await deleteBooking();
    if (success) {
      router.push('/bookings');
    }
  };

  const handleSimulatedPayment = async () => {
    const updated = await onPayNow();
    if (updated) {
      setBooking(updated)
      setShowPaymentDialog(false);
      // Show success message
      setTimeout(() => {
        router.push(`/bookings/${bookingId}?payment=success`);
      }, 100);
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending payment': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-24">
        <div className="flex justify-center items-center min-h-[400px]">
          <div>Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto p-4 pt-24">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Booking Not Found</h3>
            <p className="text-gray-500 mb-4">{error || "The booking could not be found."}</p>
            <Button onClick={() => router.push('/bookings')}>
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
    const itemOwnerId = booking.item?.owner
    ? (typeof booking.item.owner === 'object' && booking.item.owner !== null
        ? booking.item.owner._id
        : booking.item.owner)
    : null;

    const isOwner = currentUserId === itemOwnerId;
    const isRenter = currentUserId === booking.renter._id;

  return (
    <div className="container mx-auto p-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <Button variant="outline" onClick={() => router.push('/bookings')}>
            Back to Bookings
          </Button>
        </div>
        {/* Payment Success Alert */}
        {paymentSuccess && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <AlertDescription className="text-green-800">
              <strong>Payment Successful!</strong> Your booking is now confirmed and paid.
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {actionError}
          </div>
        )}

        <div className="space-y-6">
          {/* Booking Status Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Booking Status</CardTitle>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-mono text-sm">{booking._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {booking.status === 'cancelled' && booking.cancellationReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-semibold text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{booking.cancellationReason}</p>
                  {booking.cancelledBy && (
                    <p className="text-xs text-red-600 mt-2">
                      Cancelled by: {booking.cancelledBy.name}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <img 
                  src={booking.item.imageUrl} 
                  alt={booking.item.title}
                  className="w-48 h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">{booking.item.title}</h3>
                  <p className="text-gray-600 capitalize">Category: {booking.item.category}</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ${booking.item.pricePerDay} / day
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/items/${booking.item._id}`)}
                  >
                    View Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-semibold">{formatDate(booking.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-semibold">{formatDate(booking.endDate)}</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-2xl font-bold text-green-600">
                  ${booking.totalPrice.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Renter</p>
                <p className="font-semibold">{booking.renter.name}</p>
                <p className="text-sm text-gray-600">{booking.renter.email}</p>
              </div>
              {typeof booking.item.owner === 'object' && booking.item.owner !== null && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500">Item Owner</p>
                  <p className="font-semibold">{booking.item.owner.name}</p>
                  <p className="text-sm text-gray-600">{booking.item.owner.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {/* Owner: Confirm pending booking */}
                {isOwner && booking.status === 'pending' && (
                  <Button 
                    onClick={handleConfirm}
                    disabled={actionLoading}
                  >
                    Confirm Booking
                  </Button>
                )}

                {/* Owner: Set to pending payment after confirmation */}
                {isOwner && booking.status === 'confirmed' && (
                  <Button 
                    onClick={handleSetPendingPayment}
                    disabled={actionLoading}
                  >
                    Request Payment
                  </Button>
                )}

                {/* Pending Payment geting filled */}
                {isRenter && booking.status === 'pending payment' && (
                  <Button 
                    onClick={handleSimulatedPayment}
                    disabled={actionLoading}
                  >
                    Make Payment
                  </Button>
                )}

                {/* Cancel booking (both owner and renter) */}
                {(isOwner || isRenter) && 
                 ['pending', 'confirmed', 'pending payment'].includes(booking.status) && (
                  <Button 
                    variant="destructive"
                    onClick={handleCancelClick}
                    disabled={actionLoading}
                  >
                    Cancel Booking
                  </Button>
                )}

                {/* Delete (renter only, pending only) */}
                {isRenter && booking.status === 'pending' && (
                  <Button 
                    variant="outline"
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="text-red-600"
                  >
                    Delete Booking
                  </Button>
                )}
              </div>

              {actionLoading && (
                <p className="text-sm text-gray-500 mt-2">Processing...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Please provide a detailed reason for cancelling this booking. 
                This will be communicated to the {isOwner ? 'renter' : 'owner'}.
              </p>
              <div>
                <Label htmlFor="cancellation-reason">
                  Cancellation Reason *
                </Label>
                <Textarea
                  id="cancellation-reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g., Item no longer available, Change of plans, etc."
                  rows={4}
                  className="mt-2"
                />
                {cancellationReason.length > 0 && cancellationReason.length < 10 && (
                  <p className="text-sm text-red-500 mt-1">
                    Please provide at least 10 characters
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancellationReason('');
                }}
                disabled={actionLoading}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubmit}
                disabled={actionLoading || cancellationReason.length < 10}
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Simulated Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simulated Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert>
                <AlertDescription>
                   This is a <strong>simulated payment system</strong>. No real charges will be made.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Item:</span>
                    <span className="font-medium">{booking.item.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rental Period:</span>
                    <span className="font-medium">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">${booking.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                <p className="font-semibold text-blue-800 mb-2">Test Information:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>2-second processing delay (simulated)</li>
                  <li>10% chance of payment failure (for testing)</li>
                  <li>Status will change to "paid" on success</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSimulatedPayment}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? 'Processing...' : `Pay $${booking.totalPrice.toFixed(2)}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
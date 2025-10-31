// app/bookings/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BookingCard from '@/components/booking/booking-card';
import { useBookings } from '@/hooks/use-bookings';
import { useBookingActions } from '@/hooks/use-booking-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getUserRole } from '@/lib/auth-utils';

export default function BookingsPage() {

  const router = useRouter();
  const userRole = getUserRole();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  
  const { bookings, setBookings, loading, error } = useBookings({ status: statusFilter });
  const { 
    confirmBooking, 
    onRequestPayment, 
    cancelBooking, 
    deleteBooking, 
    loading: actionLoading, 
    error: actionError 
  } = useBookingActions(selectedBookingId);

  const handleConfirm = async (bookingId: string) => {
    setSelectedBookingId(bookingId);
    const updated = await confirmBooking();
    
    if (updated) {
      setBookings(prev => prev.map(b => b._id === bookingId ? updated : b));
    }
  };

  const handleRequestPayment = async (bookingId: string) => {
    setSelectedBookingId(bookingId);
    const updated = await onRequestPayment();
    
    if (updated) {
      setBookings(prev => prev.map(b => b._id === bookingId ? updated : b));
    }
  };

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setShowCancelDialog(true);
    setCancellationReason('');
  };

  const handleCancelSubmit = async () => {
    if (!selectedBookingId) return;
    
    const updated = await cancelBooking(cancellationReason);
    
    if (updated) {
      setBookings(prev => prev.map(b => b._id === selectedBookingId ? updated : b));
      setShowCancelDialog(false);
      setCancellationReason('');
      setSelectedBookingId(null);
    }
  };

  const handleDelete = async (bookingId: string) => {
    setSelectedBookingId(bookingId);
    const success = await deleteBooking();
    
    if (success) {
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    }
  };

  const handlePayNow = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`); // Go to detail page where payment dialog is shown
  };

  const filterByStatus = (status?: string) => {
    setStatusFilter(status);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-24">
        <div className="flex justify-center items-center min-h-[400px]">
          <div>Loading bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {userRole === 'owner' ? 'Booking Requests' : 'My Bookings'}
          </h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {actionError}
          </div>
        )}

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => filterByStatus(undefined)}>
              All
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => filterByStatus('pending')}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="confirmed" onClick={() => filterByStatus('confirmed')}>
              Confirmed
            </TabsTrigger>
            <TabsTrigger value="pending-payment" onClick={() => filterByStatus('pending payment')}>
              Pending Payment
            </TabsTrigger>
            <TabsTrigger value="paid" onClick={() => filterByStatus('paid')}>
              Paid
            </TabsTrigger>
            <TabsTrigger value="cancelled" onClick={() => filterByStatus('cancelled')}>
              Cancelled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No bookings found</p>
                  {userRole === 'renter' && (
                    <Button onClick={() => router.push('/dashboard')}>
                      Browse Items
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onConfirm={() => handleConfirm(booking._id)}
                    onRequestPayment={() => handleRequestPayment(booking._id)}
                    onPayNow={() => handlePayNow(booking._id)}
                    onCancel={() => handleCancelClick(booking._id)}
                    onDelete={() => handleDelete(booking._id)}
                    onViewDetails={() => router.push(`/bookings/${booking._id}`)}
                    loading={actionLoading && selectedBookingId === booking._id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Other tab contents show filtered results */}
          {['pending', 'confirmed', 'pending-payment', 'paid', 'cancelled'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              <div className="grid gap-4">
                {bookings.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onConfirm={() => handleConfirm(booking._id)}
                    onRequestPayment={() => handleRequestPayment(booking._id)}
                    onPayNow={() => handlePayNow(booking._id)}
                    onCancel={() => handleCancelClick(booking._id)}
                    onDelete={() => handleDelete(booking._id)}
                    onViewDetails={() => router.push(`/bookings/${booking._id}`)}
                    loading={actionLoading && selectedBookingId === booking._id}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="cancellation-reason">
                  Cancellation Reason *
                </Label>
                <Textarea
                  id="cancellation-reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a detailed reason for cancellation (at least 10 characters)"
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
      </div>
    </div>
  );
}
// hooks/use-booking-actions.ts
import { useState } from 'react';
import { fetchWithAuth, getUserId } from '@/lib/auth-utils';
import { Booking } from './use-bookings';

export function useBookingActions(bookingId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Owner confirms booking
  const confirmBooking = async (): Promise<Booking | null> => {
    if (!bookingId) return null;
    
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to confirm booking");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Owner moves to pending payment
  const setPendingPayment = async (): Promise<Booking | null> => {
    if (!bookingId) return null;
    
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'pending payment' }),
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update payment status");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to update payment status");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking (owner or renter)
  const cancelBooking = async (reason: string): Promise<Booking | null> => {
    if (!bookingId) return null;
    
    if (!reason || reason.trim().length < 10) {
      setError("Please provide a detailed cancellation reason (at least 10 characters)");
      return null;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellationReason: reason,
          cancelledBy: getUserId()
        }),
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to cancel booking");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete booking (renter only, pending bookings)
  const deleteBooking = async (): Promise<boolean> => {
    if (!bookingId) return false;
    
    if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return false;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        return true;
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to delete booking");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete booking");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    confirmBooking, 
    setPendingPayment,
    cancelBooking, 
    deleteBooking, 
    loading, 
    error 
  };
}       
// hooks/use-bookings.ts
import { useState, useEffect } from 'react';
import { fetchWithAuth, getUserId, getUserRole } from '@/lib/auth-utils';

export interface Booking {
  _id: string;
  item: {
    _id: string;
    title: string;
    imageUrl: string;
    pricePerDay: number;
    category: string;
    owner: string | { _id: string; name: string; email: string };
  };
  renter: {
    _id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'pending payment' | 'confirmed' | 'cancelled';
  cancellationReason?: string;
  cancelledBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useBookings(filters?: { status?: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");
        
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        
        const url = `/api/bookings${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetchWithAuth(url);
        
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        } else {
          const errorData = await res.json();
          console.log("The error is here", errorData);
          setError(errorData.error || `Failed to fetch bookings: ${res.status}`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filters?.status]);

  return { bookings, setBookings, loading, error };
}

export function useBooking(bookingId: string | null) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetchWithAuth(`/api/bookings/${bookingId}`);
        
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        } else {
          const errorData = await res.json();
          console.log("The error is here", errorData);
          setError(errorData.error || `Failed to fetch booking: ${res.status}`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch booking");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  return { booking, setBooking, loading, error };
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const createBooking = async (bookingData: {
    item: string;
    startDate: string;
    endDate: string;
  }): Promise<Booking | null> => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to create booking");
        return null;
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
}
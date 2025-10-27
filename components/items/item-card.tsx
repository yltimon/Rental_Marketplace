// components/items/item-card.tsx
'use client';

import { useState } from 'react';
import {Star, MapPin } from "lucide-react"
import { useRouter, useParams } from 'next/navigation';
import { useCreateBooking } from '@/hooks/use-bookings'

interface ItemCardProps {
  item: {
    id: string
    title: string
    description: string
    price: number
    category: string
    location: string
    rating: number
    reviewCount: number
    image: string
    available: boolean
    owner: {
      name: string
      email: string
    }
  }
}

export function ItemCard({ item }: ItemCardProps) {

  const params = useParams();
  const router = useRouter();

  const bookingId = params.id as string;

  const { createBooking, loading, error } = useCreateBooking();

  const [showForm, setShowForm] = useState(false);
  const [startDateInput, setStartDateInput] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  const [endDateInput, setEndDateInput] = useState<string>(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleRentNow = async () => {
    if (!item?.id) return;
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmitBooking = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!item?.id) return;

    const now = new Date();
    const start = new Date(startDateInput);
    const end = new Date(endDateInput);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setFormError("Please enter valid dates.");
      return;
    }

    if (start == now) {
      setFormError("Start date cannot be today.");
      return;
    }

    if (start < now) {
      setFormError("Start date cannot be in the past.");
      return;
    }

    if (end <= start) {
      setFormError("End date must be after start date.");
      return;
    }

    const bookingData = {
      item: item.id,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    const booking = await createBooking(bookingData);

    if (booking) {
      // navigate to booking details or bookings list
      const bookingId = (booking as any)._id || (booking as any).id;
 
      router.push("/bookings");
    } else {
      // show error from hook or fallback message
      alert(error || "Failed to create booking");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormError(null);
  }
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-200">
      
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmitBooking}
            className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3">Rent {item.title}</h3>

            <label className="block text-sm mb-2">
              Start date
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="mt-1 block w-full border rounded px-2 py-1"
                required
              />
            </label>

            <label className="block text-sm mb-3">
              End date
              <input
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                className="mt-1 block w-full border rounded px-2 py-1"
                required
              />
            </label>

            {formError && <div className="text-sm text-red-500 mb-2">{formError}</div>}

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={handleCloseForm} className="px-3 py-2 rounded bg-gray-200">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                {loading ? "Processing..." : "Confirm Rental"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        


        {/* Status Badge */}
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
          item.available ? "bg-green-500 text-white" : "bg-gray-500 text-white"
        }`}>
          {item.available ? "Available" : "Rented"}
        </span>
      </div>

      <div className="p-4">
        {/* Category */}
        <span className="inline-block px-2 py-1 text-xs border border-gray-300 rounded-full mb-2 capitalize">
          {item.category}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="line-clamp-1">{item.location}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span className="text-sm font-medium mr-1">{item.rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">
            ({item.reviewCount} reviews)
          </span>
        </div>

        {/* Owner */}
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Hosted by {item.owner.name}
          </span> <br />
          <span className="text-sm text-gray-500">
            Contact at <a href={`mailto:${item.owner.email}`} className="text-blue-500 underline ml-1">{item.owner.email}</a>
          </span>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ${item.price}
            </span>
            <span className="text-sm text-gray-500 ml-1">/day</span>
          </div>
          
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              item.available 
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick = {handleRentNow}
            disabled={!item.available || loading}
          >
            {loading ? "Processing..." : item.available ? "Rent Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  )
}
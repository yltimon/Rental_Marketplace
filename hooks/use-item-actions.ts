// hooks/use-item-actions.ts

// PATCH & DELETE items by id

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/auth-utils';

interface Item {
  _id: string;
  title: string;
  description: string;
  pricePerDay: number;
  category: 'apartment' | 'equipment' | 'furniture' | 'vehicles' | 'space' | 'tools' | 'others';
  location: string;
  imageUrl: string;
  available: boolean;
  averageRating: number;
  reviewCount: number;
  owner: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface ItemFormData {
  title: string;
  description: string;
  pricePerDay: number;
  category: 'apartment' | 'equipment' | 'furniture' | 'vehicles' | 'space' | 'tools' | 'others';
  location: string;
  imageUrl: string;
  available: boolean;
}

export function useItemActions(itemId: string | null) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const updateItem = async (formData: ItemFormData): Promise<Item | null> => {
    if (!itemId) return null;
    
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      const updated = await res.json();
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to update item");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (): Promise<boolean> => {
    if (!itemId) return false;
    
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return false;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetchWithAuth(`/api/items/${itemId}`, { 
        method: "DELETE" 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete item");
      }

      router.push("/dashboard/my-listings");
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete item");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateItem, deleteItem, loading, error };
}
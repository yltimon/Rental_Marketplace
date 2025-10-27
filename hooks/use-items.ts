// hooks/use-items.ts
// Get owner's items and single item by ID
import { useState, useEffect } from 'react';
import { fetchWithAuth, getUserId } from '@/lib/auth-utils';

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

export function useUserItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`/api/items?owner=${userId}`);
        
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        } else {
          setError(`Failed to fetch items: ${res.status}`);
        }
      } catch (err) {
        setError("Failed to fetch items");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, setItems, loading, error };
}

export function useItem(itemId: string | null) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetchWithAuth(`/api/items/${itemId}`);
        
        if (res.ok) {
          const data = await res.json();
          setItem(data);
        } else {
          setError(`Failed to fetch item: ${res.status}`);
        }
      } catch (err) {
        setError("Failed to fetch item");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  return { item, setItem, loading, error };
}
// app/renter/items/page.tsx
'use client';

import { ItemCard } from "@/components/items/item-card";
import { transformBackendItem } from "@/lib/data-transform";
import { useEffect, useState } from "react";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setError(null);
        const response = await fetch('/api/items');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.status}`);
        }
        
        const backendItems = await response.json();
        const transformedItems = backendItems.map(transformBackendItem);
        setItems(transformedItems);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-6xl mb-4">Error</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Items</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Items
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find the perfect items for your needs. Rent from trusted owners in your community.
        </p>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No items found</h3>
          <p className="text-gray-500">Check back later for new listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
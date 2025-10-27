// app/view-edit-delete-listing/page.tsx
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

import MyListingSidebar from "../listing/my-listing-sidebar";
import ItemViewMode from "../listing/item-view-mode";
import ItemEditMode from "../listing/item-edit-mode";
import { useUserItems, useItem } from "@/hooks/use-items";
import { useItemActions } from "@/hooks/use-item-actions";
import { getUserId, getUserRole, isAuthenticated, isOwner } from "@/lib/auth-utils";

interface ItemFormData {
  title: string;
  description: string;
  pricePerDay: number;
  category: 'apartment' | 'equipment' | 'furniture' | 'vehicles' | 'space' | 'tools' | 'others';
  location: string;
  imageUrl: string;
  available: boolean;
}

export default function ViewEditDeleteListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");
  
  const [isClient, setIsClient] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ItemFormData>({
    title: "",
    description: "",
    pricePerDay: 0,
    category: "others",
    location: "",
    imageUrl: "",
    available: true
  });

  // Custom hooks for data fetching
  const { items: myItems, setItems: setMyItems, loading: loadingItems, error: itemsError } = useUserItems();
  const { item, setItem, loading: loadingItem, error: itemError } = useItem(itemId);
  const { updateItem, deleteItem, loading: actionLoading, error: actionError } = useItemActions(itemId);

  // Client-side hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Authentication check
  useEffect(() => {
    if (isClient && !isAuthenticated()) {
      router.push("/login");
    }
  }, [isClient, router]);

  // Authorization check - only owner of the item can access
  useEffect(() => {
    if (!isClient || !item) return;

    const userId = getUserId();
    const role = getUserRole();
    
    // Check if user is an owner role
    if (role !== "owner") {
      router.push("/dashboard");
      return;
    }

    // Check if user owns this specific item
    const itemOwnerId = typeof item.owner === 'object' && item.owner !== null 
      ? (item.owner as any)._id 
      : item.owner;

    if (itemOwnerId !== userId) {
      router.push("/dashboard");
    }
  }, [item, isClient, router]);

  // Pre-populate form when item loads
  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        description: item.description,
        pricePerDay: item.pricePerDay,
        category: item.category,
        location: item.location,
        imageUrl: item.imageUrl,
        available: item.available
      });
    }
  }, [item]);

  // Handle form updates
  const handleFormChange = (field: keyof ItemFormData, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle item update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updated = await updateItem(form);
    if (updated) {
      setItem(updated);
      setEditMode(false);
      // Update the item in myItems list
      setMyItems(prev => prev.map(i => i._id === itemId ? updated : i));
    }
  };

  // Handle item delete
  const handleDelete = async () => {
    const success = await deleteItem();
    if (success && itemId) {
      // Remove from myItems list
      setMyItems(prev => prev.filter(i => i._id !== itemId));
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    // Reset form to current item data
    if (item) {
      setForm({
        title: item.title,
        description: item.description,
        pricePerDay: item.pricePerDay,
        category: item.category,
        location: item.location,
        imageUrl: item.imageUrl,
        available: item.available
      });
    }
  };

  // Show loading during hydration
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated()) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Redirecting to login...</div>
      </div>
    );
  }

  if (loadingItems) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading your listings...</div>
      </div>
    );
  }

  const error = itemsError || itemError || actionError;

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <MyListingSidebar 
          myItems={myItems} 
          itemId={itemId} 
          router={router} 
          userId={getUserId()} 
        />

        {/* Main Content */}
        <div className="lg:col-span-3">
          {!itemId ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Select a Listing</h3>
                <p className="text-gray-500 mb-4">
                  Choose an item from your listings to view or edit its details.
                </p>
                <Button onClick={() => router.push("/create-listing")}>
                  Create New Listing
                </Button>
              </CardContent>
            </Card>
          ) : loadingItem ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div>Loading item details...</div>
              </CardContent>
            </Card>
          ) : item ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Listing Details</CardTitle>
                {!editMode && (
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    item.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                
                {actionLoading && (
                  <div className="text-blue-500 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    Processing...
                  </div>
                )}
                
                {!editMode ? (
                  <ItemViewMode
                    item={item}
                    onEdit={() => setEditMode(true)}
                    onDelete={handleDelete}
                    onBack={() => router.push("/dashboard")}
                  />
                ) : (
                  <ItemEditMode
                    form={form}
                    onSubmit={handleUpdate}
                    onCancel={handleCancelEdit}
                    onChange={handleFormChange}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Item Not Found</h3>
                <p className="text-gray-500 mb-4">
                  The selected item could not be found or you don't have permission to view it.
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
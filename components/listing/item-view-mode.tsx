// components/listing/item-view-mode.tsx
import { Button } from "@/components/ui/button";

interface Item {
  _id: string;
  title: string;
  description: string;
  pricePerDay: number;
  category: string;
  location: string;
  imageUrl: string;
  available: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ItemViewModeProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function ItemViewMode({ 
  item, 
  onEdit, 
  onDelete, 
  onBack 
}: ItemViewModeProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-64 lg:h-80 object-cover rounded-lg" 
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.jpg';
            }}
          />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
            <p className="text-lg font-semibold text-blue-600 mt-1">
              ${item.pricePerDay} / day
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="capitalize bg-gray-100 px-3 py-1 rounded-full">
              {item.category}
            </span>
            <span>📍 {item.location}</span>
          </div>

          {item.averageRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{item.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({item.reviewCount} reviews)</span>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="text-sm text-gray-500">
            <p>Listed on: {formatDate(item.createdAt)}</p>
            {item.updatedAt !== item.createdAt && (
              <p>Last updated: {formatDate(item.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onEdit}>
          Edit Listing
        </Button>
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back to Dashboard
        </Button>
        <Button 
          variant="destructive" 
          onClick={onDelete}
          className="ml-auto"
        >
          Delete Listing
        </Button>
      </div>
    </div>
  );
}
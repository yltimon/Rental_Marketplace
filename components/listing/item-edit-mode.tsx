// components/listing/item-edit-mode.tsx

// Editing Form
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ItemFormData {
  title: string;
  description: string;
  pricePerDay: number;
  category: 'apartment' | 'equipment' | 'furniture' | 'vehicles' | 'space' | 'tools' | 'others';
  location: string;
  imageUrl: string;
  available: boolean;
}

interface ItemEditModeProps {
  form: ItemFormData;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: keyof ItemFormData, value: string | number | boolean) => void;
}

const CATEGORIES = [
  'apartment',
  'equipment', 
  'furniture',
  'vehicles',
  'space',
  'tools',
  'others'
] as const;

export default function ItemEditMode({ 
  form, 
  onSubmit, 
  onCancel, 
  onChange 
}: ItemEditModeProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => onChange('title', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="pricePerDay">Price per Day ($) *</Label>
            <Input
              id="pricePerDay"
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerDay}
              onChange={e => onChange('pricePerDay', parseFloat(e.target.value))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={form.category} 
              onValueChange={(value: ItemFormData['category']) => onChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    <span className="capitalize">{cat}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={e => onChange('location', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl}
              onChange={e => onChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
            />
            {form.imageUrl && (
              <div className="mt-2">
                <img 
                  src={form.imageUrl} 
                  alt="Preview" 
                  className="h-32 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label htmlFor="available" className="cursor-pointer">
              Available for Rent
            </Label>
            <Switch
              id="available"
              checked={form.available}
              onCheckedChange={(checked) => onChange('available', checked)}
            />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={e => onChange('description', e.target.value)}
            rows={4}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit">Save Changes</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
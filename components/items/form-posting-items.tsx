'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function FormPostingItems() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        description: "",
        pricePerDay: "",
        owner: "", // owner's user ID
        category: "equipment",
        location: "",
        imageUrl: "",
    });

    useEffect(() => {
        const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        if (userId) {
            setForm((prev) => ({ ...prev, owner: userId }));
        }
    }, []);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

     // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);
        setError("");
        try {
        const data = new FormData();
        data.append("image", file);

        const res = await fetch("/api/uploadImage", {
            method: "POST",
            body: data,
        });
        const result = await res.json();
        if (res.ok && result.url) {
            setForm((prev) => ({ ...prev, imageUrl: result.url }));
            setImageFile(file);
        } else {
            setError(result.error || "Image upload failed");
        }
        } catch (err) {
        setError("Image upload failed");
        }
        setUploading(false);
    };

     // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
        }));
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            ...form,
            pricePerDay: parseFloat(form.pricePerDay),
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.message || "Failed to add item");
            return;
        }
        router.push("/dashboard/my-listings");
        } catch (err) {
        setError("Failed to add item");
        }
    };
    return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Add New Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" className="mt-2 h-32 object-cover rounded" />
              )}
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="pricePerDay">Price Per Day</Label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                step="0.01"
                value={form.pricePerDay}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="equipment">Equipment</option>
                <option value="apartment">Apartment</option>
                <option value="furniture">Furniture</option>
                <option value="vehicles">Vehicles</option>
                <option value="space">Space</option>
                <option value="tools">Tools</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={form.location} onChange={handleChange} required />
            </div>
            {/* Owner field can be hidden if you set it from the logged-in user */}
            <Input type="hidden" name="owner" value={form.owner} />
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Uploading..." : "Add Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
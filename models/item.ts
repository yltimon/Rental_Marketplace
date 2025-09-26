import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
    category: { type: String, enum: ['apartment', 'equipment', 'furniture', 'vehicles', 'space', 'tools', 'others'], default: 'others' },
    location: { type: String, required: true},
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);
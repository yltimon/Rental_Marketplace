import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema (
    {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, required: false },
    }, { timestamps: true }
);

export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/review";
import { User } from "@/models/user";
import { Item } from "@/models/item";

// GET single review
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        
        const review = await Review.findById(id)
            .populate('reviewer', 'name email')
            .populate('reviewee', 'name email')
            .populate('item', 'title imageUrl category');
            
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }
        
        return NextResponse.json(review, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update review (only comment)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const { comment, rating } = await req.json();
        
        const updatedReview = await Review.findByIdAndUpdate(id, { comment, rating },{ new: true })
        .populate('reviewer', 'name email')
        .populate('reviewee', 'name email')
        .populate('item', 'title imageUrl category');
        
        if (!updatedReview) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }
        
        return NextResponse.json(updatedReview, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE review
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        
        const review = await Review.findById(id);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }
        
        const { reviewee, item } = review;
        await Review.findByIdAndDelete(id);
        
        // Update average ratings after deletion
        if (reviewee) {
            const userReviews = await Review.find({ reviewee });
            const avgRating = userReviews.length > 0 
                ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length 
                : 0;
                
            await User.findByIdAndUpdate(reviewee, {
                averageRating: Math.round(avgRating * 10) / 10,
                reviewCount: userReviews.length
            });
        }
        
        if (item) {
            const itemReviews = await Review.find({ item });
            const avgRating = itemReviews.length > 0 
                ? itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length 
                : 0;
                
            await Item.findByIdAndUpdate(item, {
                averageRating: Math.round(avgRating * 10) / 10,
                reviewCount: itemReviews.length
            });
        }
        
        return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
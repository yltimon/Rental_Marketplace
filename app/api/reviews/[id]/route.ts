// app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/review";
import { User } from "@/models/user";
import { Item } from "@/models/item";
import { verifyToken, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-middleware";

// GET single review (public)
export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
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
        console.error("Fetch review error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update review (only reviewer can edit their own review)
export async function PATCH(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        
        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to update review");
        }
        
        const { id } = await params;
        const { comment, rating } = await req.json();
        
        // Find the review
        const review = await Review.findById(id);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }
        
        // Authorization: Only the reviewer can update their own review
        if (review.reviewer.toString() !== auth.userId) {
            return forbiddenResponse("You can only edit your own reviews");
        }
        
        // Validate rating if provided
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }
        
        // Update the review
        const updateData: any = {};
        if (comment !== undefined) updateData.comment = comment;
        if (rating !== undefined) updateData.rating = rating;
        
        const updatedReview = await Review.findByIdAndUpdate(
            id, 
            updateData,
            { new: true, runValidators: true }
        )
        .populate('reviewer', 'name email')
        .populate('reviewee', 'name email')
        .populate('item', 'title imageUrl category');
        
        // If rating was updated, recalculate averages
        if (rating !== undefined) {
            // Extract IDs from populated fields
            const revieweeId = typeof updatedReview.reviewee === 'object' && updatedReview.reviewee !== null
                ? (updatedReview.reviewee as any)._id.toString()
                : updatedReview.reviewee.toString();
            const itemId = typeof updatedReview.item === 'object' && updatedReview.item !== null
                ? (updatedReview.item as any)._id.toString()
                : updatedReview.item.toString();
            
            await updateAverageRatings(revieweeId, itemId);
        }
        
        return NextResponse.json(updatedReview, { status: 200 });
    } catch (error: any) {
        console.error("Update review error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE review (only reviewer can delete their own review)
export async function DELETE(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        
        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to delete review");
        }
        
        const { id } = await params;
        
        const review = await Review.findById(id);
        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }
        
        // Authorization: Only the reviewer can delete their own review
        if (review.reviewer.toString() !== auth.userId) {
            return forbiddenResponse("You can only delete your own reviews");
        }
        
        const { reviewee, item } = review;
        
        // Extract IDs from potentially populated fields
        const revieweeId = typeof reviewee === 'object' && reviewee !== null
            ? (reviewee as any)._id.toString()
            : reviewee.toString();
        const itemId = typeof item === 'object' && item !== null
            ? (item as any)._id.toString()
            : item.toString();
        
        await Review.findByIdAndDelete(id);
        
        // Update average ratings after deletion
        await updateAverageRatings(revieweeId, itemId);
        
        return NextResponse.json({ 
            message: "Review deleted successfully",
            deletedId: id 
        }, { status: 200 });
    } catch (error: any) {
        console.error("Delete review error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper function to update average ratings
async function updateAverageRatings(userId: string, itemId: string) {
    try {
        // Update user's average rating
        if (userId) {
            const userReviews = await Review.find({ reviewee: userId });
            const avgRating = userReviews.length > 0 
                ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length 
                : 0;
                
            await User.findByIdAndUpdate(userId, {
                averageRating: Math.round(avgRating * 10) / 10,
                reviewCount: userReviews.length
            });
        }
        
        // Update item's average rating
        if (itemId) {
            const itemReviews = await Review.find({ item: itemId });
            const avgRating = itemReviews.length > 0 
                ? itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length 
                : 0;
                
            await Item.findByIdAndUpdate(itemId, {
                averageRating: Math.round(avgRating * 10) / 10,
                reviewCount: itemReviews.length
            });
        }
    } catch (error) {
        console.error("Error updating average ratings:", error);
    }
}
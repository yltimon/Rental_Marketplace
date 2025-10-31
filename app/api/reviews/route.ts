import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/review";
import { Booking } from "@/models/booking";
import { Item } from "@/models/item";
import { User } from "@/models/user";
import { verifyToken, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-middleware";

// GET all reviews with optional filters
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('item');
        const userId = searchParams.get('user');

        let query: any = {};
        if (itemId) query.item = itemId;
        if (userId) query.reviewee = userId;

        const reviews = await Review.find(query)
            .populate('reviewer', 'name email')
            .populate('reviewee', 'name email')
            .populate('item', 'title description imageUrl category')
            .sort({ createdAt: -1 });
            
        return NextResponse.json(reviews, { status: 200 });
    } catch (error: any) {
        console.error("Fetch reviews error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// POST a new review (requires authentication and completed booking)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Verify authentication
    const auth = await verifyToken(req);
    if (!auth) {
        return unauthorizedResponse("Please log in to submit a review");
    }

    let { reviewee, item, rating, comment } = await req.json();
    const reviewer = auth.userId; // Force reviewer to be authenticated user

    // Validate required fields
    if (!rating) {
      return NextResponse.json(
        { error: "Rating is required." },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    // Determine review type and validate permissions
    if (item && !reviewee) {
      // CASE 1: Renter reviewing an item (and owner)
      if (auth.role !== 'renter') {
        return forbiddenResponse("Only renters can review items");
      }

      // Verify renter has a completed booking for this item
      const booking = await Booking.findOne({ 
        renter: reviewer, 
        item,
        status: 'paid'
      });
      
      if (!booking) {
        return NextResponse.json(
          { error: "You can only review items you've successfully rented." },
          { status: 403 }
        );
      }
      
      // Get item owner as reviewee
      const itemDoc = await Item.findById(item);
      if (!itemDoc) {
        return NextResponse.json(
          { error: "Item not found." },
          { status: 404 }
        );
      }
      reviewee = itemDoc.owner;

      // Prevent reviewing your own item
      if (reviewee.toString() === reviewer) {
        return NextResponse.json(
          { error: "You cannot review your own item." },
          { status: 400 }
        );
      }

      // Check for existing review for this item by this reviewer
      const existingItemReview = await Review.findOne({ reviewer, item });
      if (existingItemReview) {
        return NextResponse.json(
          { error: "You have already reviewed this item." },
          { status: 409 }
        );
      }

    } else if (reviewee && !item) {
      // CASE 2: Owner reviewing a renter
      if (auth.role !== 'owner') {
        return forbiddenResponse("Only owners can review renters");
      }

      // Find a confirmed booking where owner's item was rented by reviewee
      const ownedItems = await Item.find({ owner: reviewer }).select('_id');
      const itemIds = ownedItems.map(i => i._id);

      const booking = await Booking.findOne({ 
        renter: reviewee,
        item: { $in: itemIds },
        status: 'paid'
      }).populate('item');
      
      if (!booking) {
        return NextResponse.json(
          { error: "No paid booking found. You can only review renters who rented your items." },
          { status: 403 }
        );
      }

      item = (booking.item as any)._id;

      // Prevent self-review
      if (reviewee.toString() === reviewer) {
        return NextResponse.json(
          { error: "You cannot review yourself." },
          { status: 400 }
        );
      }

      // Check for existing review for this renter by this owner
      const existingUserReview = await Review.findOne({ 
        reviewer, 
        reviewee,
        item 
      });
      if (existingUserReview) {
        return NextResponse.json(
          { error: "You have already reviewed this renter for this booking." },
          { status: 409 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Must specify either item (for item/owner reviews) or reviewee (for renter reviews)." },
        { status: 400 }
      );
    }

    // Create the review
    const review = new Review({ 
      reviewer, 
      reviewee, 
      item, 
      rating, 
      comment: comment || "" 
    });
    await review.save();
    
    // Update average ratings
    await updateAverageRatings(reviewee, item);
    
    // Populate the review for response
    await review.populate('reviewer', 'name email');
    await review.populate('reviewee', 'name email');
    await review.populate('item', 'title imageUrl category');

    return NextResponse.json(
      { message: "Review created successfully", review },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Review creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Helper function to update average ratings
async function updateAverageRatings(userId: string, itemId: string) {
  try {
    // Update user's average rating (as reviewee)
    if (userId) {
      const userReviews = await Review.find({ reviewee: userId });
      const avgRating = userReviews.length > 0 
        ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
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
        ? itemReviews.reduce((sum, review) => sum + review.rating, 0) / itemReviews.length 
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

import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models/booking";
import { Item } from "@/models/item"; 
import { verifyToken, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-middleware";

// GET - Fetch bookings (filtered by user role)
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to view bookings");
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        let query: any = {};

        // Role-based filtering
        if (auth.role === 'renter') {
            // Renters can only see their own bookings
            query.renter = auth.userId;
        } else if (auth.role === 'owner') {
            // Owners see bookings for their items
            // First, get all items owned by this user
            const ownerItems = await Item.find({ owner: auth.userId }).select('_id');
            const itemIds = ownerItems.map(item => item._id);
            query.item = { $in: itemIds };
        } else {
            return forbiddenResponse("You do not have permission to view bookings");
        }

        // Additional filters
        if (userId && userId === auth.userId) {
            query.renter = userId;
        }
        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('item')
            .populate('renter', 'name email')
            .populate('cancelledBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(bookings, { status: 200});
    } catch (error: any) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: error.message}, { status: 500});
    }
}

// POST - Create a new booking (renters only)
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to create a booking");
        }

        // Only renters can create bookings
        if (auth.role !== 'renter') {
            return forbiddenResponse("Only renters can create bookings");
        }

        const body = await req.json();
        const { item: itemId, startDate, endDate } = body;
        
        // Validate required fields
        if (!itemId || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields: item, startDate, or endDate" }, 
                { status: 400 }
            );
        }
        
        // Fetch items and validate
        const item = await Item.findById(itemId).populate('owner');
        if (!item) {
            return NextResponse.json(
                { error: "Item not found" }, 
                { status: 404 }
            );
        }

        // Check if item is available
        if(!item.available) {
            return NextResponse.json(
                { error: "Item is not available for booking" }, 
                { status: 400 }
            );
        }

        // Prevent self-booking (renter can't book their own items)
        const ownerId = typeof item.owner === 'object' && item.owner !== null
            ? (item.owner as any)._id.toString()
            : item.owner.toString();
            
        if (ownerId === auth.userId) {
            return NextResponse.json(
                { error: "You cannot book your own item" }, 
                { status: 400 }
            );
        }

        // Validate and parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" }, 
                { status: 400 }
            );
        }

        // Check if start date is in the future
        const now = new Date();
        if (start < now) {
            return NextResponse.json(
                { error: "Start date must be in the future" }, 
                { status: 400 }
            );
        }
        
        if (end <= start) {
            return NextResponse.json(
                { error: "End date must be after start date" }, 
                { status: 400 }
            );
        }

        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            item: itemId,
            status: { $in: ['pending', 'confirmed', 'pending payment'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });
        
        if (overlappingBooking) {
            return NextResponse.json(
                { error: "This item is already booked for the selected dates" },
                { status: 409 }
            );
        }
        
        // Calculate number of days (round up to account for partial days)
        const days = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate total price
        const totalPrice = Math.max(1, days) * item.pricePerDay;
        
        // Create booking with authenticated user as renter
        const booking = await Booking.create({
            item: itemId,
            renter: auth.userId, // Force renter to be the authenticated user
            startDate: start,
            endDate: end,
            totalPrice,
            status: 'pending'
        });
        
        // Populate the item and renter details in the response
        await booking.populate('item');
        await booking.populate('renter', 'name email');
        
        return NextResponse.json(booking, { status: 201 });

    } catch (error: any) {
        console.error("Booking creation error:", error);
        return NextResponse.json({ error: error.message}, { status: 500});
    }
}
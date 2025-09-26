import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models/booking";
import { Item } from "@/models/item"; // Import the Item model

export async function GET() {
    try {
        await connectToDatabase();
        const bookings = await Booking.find()
            .populate('item')
            .populate('renter', 'name email');
        return NextResponse.json(bookings, { status: 200});
    } catch (error: any) {
        return NextResponse.json({ error: error.message}, { status: 500});
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();
        
        // Validate required fields
        const { item: itemId, startDate, endDate } = body;
        
        if (!itemId || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields: item, startDate, or endDate" }, 
                { status: 400 }
            );
        }
        
        // Calculate totalPrice before creating the booking
        const item = await Item.findById(itemId);
        if (!item) {
            return NextResponse.json(
                { error: "Item not found" }, 
                { status: 404 }
            );
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" }, 
                { status: 400 }
            );
        }
        
        if (end <= start) {
            return NextResponse.json(
                { error: "End date must be after start date" }, 
                { status: 400 }
            );
        }
        
        // Calculate number of days (round up to account for partial days)
        const days = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate total price
        const totalPrice = Math.max(1, days) * item.pricePerDay;
        
        // Create booking with calculated price
        const booking = await Booking.create({
            ...body,
            totalPrice
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
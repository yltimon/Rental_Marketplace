import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models/booking";

// GET single booking
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        
        const booking = await Booking.findById(id)
            .populate('item')
            .populate('renter', 'name email');
            
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        return NextResponse.json(booking, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update booking (for status changes and cancellations)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await req.json();
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        // Validate status transitions
        if (body.status) {
            const allowedTransitions: { [key: string]: string[] } = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['cancelled'],
                'cancelled': [] // Once cancelled, no further changes
            };
            
            const currentStatus = booking.status;
            const newStatus = body.status;
            
            if (!allowedTransitions[currentStatus].includes(newStatus)) {
                return NextResponse.json(
                    { error: `Cannot change status from ${currentStatus} to ${newStatus}` },
                    { status: 400 }
                );
            }
            
            // Require cancellation reason and cancelledBy when cancelling
            if (newStatus === 'cancelled') {
                if (!body.cancellationReason) {
                    return NextResponse.json(
                        { error: "Cancellation reason is required when cancelling a booking" },
                        { status: 400 }
                    );
                }
                if (!body.cancelledBy) {
                    return NextResponse.json(
                        { error: "cancelledBy (User ID) is required when cancelling a booking" },
                        { status: 400 }
                    );
                }
            }
        }
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            id, 
            body, 
            { new: true }
        )
        .populate('item')
        .populate('renter', 'name email')
        .populate('cancelledBy', 'name email'); // Populate cancelledBy user details
        
        return NextResponse.json(updatedBooking, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE booking (only for pending bookings)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        
        const booking = await Booking.findById(id);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        // Only allow deletion of pending bookings
        if (booking.status !== 'pending') {
            return NextResponse.json(
                { error: "Only pending bookings can be deleted" },
                { status: 400 }
            );
        }
        
        await Booking.findByIdAndDelete(id);
        
        return NextResponse.json({ message: "Booking deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
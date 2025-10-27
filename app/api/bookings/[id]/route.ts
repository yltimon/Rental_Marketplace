import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models/booking";
import { Item } from "@/models/item";
import { verifyToken, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-middleware";

// GET single booking
export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to view the booking");
        }

        const { id } = await params;
        const booking = await Booking.findById(id)
            .populate('item')
            .populate('renter', 'name email')
            .populate('cancelledBy', 'name email'); 
            
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Authorization: Only renter or item owner can view
        await booking.populate('item');
        const item = booking.item as any;
        const itemOwnerId = typeof item?.owner === 'object' 
            ? (typeof item.owner === 'object' && item.owner !== null
            ? item.owner._id.toString()
            : item.owner.toString())
            : null;
        const renterId = booking.renter._id.toString();



        if (auth.userId !== renterId && auth.userId !== itemOwnerId) {
            return forbiddenResponse("You do not have permission to view this booking");
        }
        
        return NextResponse.json(booking, { status: 200 });
    } catch (error: any) {
        console.error("Fetch booking error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update booking
export async function PATCH(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to update the booking");
        }

        const { id } = await params;
        const body = await req.json();
        
        const booking = await Booking.findById(id).populate('item');
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        const item = booking.item as any;
        const itemOwnerId = typeof item?.owner === 'object' 
            ? (typeof item.owner === 'object' && item.owner !== null
            ? item.owner._id.toString()
            : item.owner.toString())
            : null;
        
        const renterId = booking.renter._id.toString();
        
        // Validate status transitions and authorization
        if (body.status) {
            const currentStatus = booking.status;
            const newStatus = body.status;
            
            // PENDING -> CONFIRMED (Owner only)
            if (currentStatus === 'pending' && newStatus === 'confirmed') {
                if (auth.userId !== itemOwnerId) {
                    return forbiddenResponse("Only the item owner can confirm bookings");
                }
                
                // Check item availability
                if (!item.available) {
                    return NextResponse.json(
                        { error: "Item is not available for booking" },
                        { status: 400 }
                    );
                }
                
                // Mark item as unavailable
                item.available = false;
                await item.save();
            }
            
            // CONFIRMED -> PENDING PAYMENT (Owner only, after confirmation)
            else if (currentStatus === 'confirmed' && newStatus === 'pending payment') {
                if (auth.userId !== itemOwnerId) {
                    return forbiddenResponse("Only the item owner can change payment status");
                }
            }
            
            // PENDING PAYMENT -> CONFIRMED (After payment - could be automated or manual)
            else if (currentStatus === 'pending payment' && newStatus === 'confirmed') {
                // Could be triggered by payment webhook or manual confirmation
                if (auth.userId !== itemOwnerId && auth.userId !== renterId) {
                    return forbiddenResponse("Only owner or renter can confirm payment");
                }
            }
            
            // CANCELLATION (Owner or Renter can cancel)
            else if (newStatus === 'cancelled') {
                const canCancel = auth.userId === renterId || auth.userId === itemOwnerId;
                
                if (!canCancel) {
                    return forbiddenResponse("You don't have permission to cancel this booking");
                }
                
                // Validate cancellation requirements
                if (!body.cancellationReason) {
                    return NextResponse.json(
                        { error: "Cancellation reason is required" },
                        { status: 400 }
                    );
                }
                
                // Set cancelledBy to authenticated user
                body.cancelledBy = auth.userId;
                
                // If booking was confirmed, make item available again
                if (currentStatus === 'confirmed' || currentStatus === 'pending payment') {
                    item.available = true;
                    await item.save();
                }
                
                // Valid transitions to cancelled
                const validCancellations = ['pending', 'confirmed', 'pending payment'];
                if (!validCancellations.includes(currentStatus)) {
                    return NextResponse.json(
                        { error: `Cannot cancel booking with status: ${currentStatus}` },
                        { status: 400 }
                    );
                }
            }
            
            // Invalid transition
            else {
                return NextResponse.json(
                    { error: `Invalid status transition from ${currentStatus} to ${newStatus}` },
                    { status: 400 }
                );
            }
        }
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            id, 
            body, 
            { new: true, runValidators: true }
        )
        .populate('item')
        .populate('renter', 'name email')
        .populate('cancelledBy', 'name email'); 
        
        return NextResponse.json(updatedBooking, { status: 200 });
    } catch (error: any) {
        console.error("Update booking error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE booking (only for pending bookings)
export async function DELETE(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to delete booking");
        }

        const { id } = await params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        
        // Only renter can delete their own booking
        const renterId = booking.renter._id.toString();
        if (auth.userId !== renterId) {
            return forbiddenResponse("Only the renter can delete their booking");
        }
        
        // Only allow deletion of pending bookings
        if (booking.status !== 'pending') {
            return NextResponse.json(
                { error: "Only pending bookings can be deleted. Please cancel confirmed bookings instead." },
                { status: 400 }
            );
        }
        
        await Booking.findByIdAndDelete(id);
        
        return NextResponse.json({ 
            message: "Booking deleted successfully",
            deletedId: id 
        }, { status: 200 });
    } catch (error: any) {
        console.error("Delete booking error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
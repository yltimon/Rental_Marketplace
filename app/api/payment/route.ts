// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models/booking";
import { verifyToken, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-middleware";

// POST - Process payment (simulated)
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        
        // Verify authentication
        const auth = await verifyToken(req);
        if (!auth) {
            return unauthorizedResponse("Please log in to process payment");
        }
        
        const { bookingId, paymentMethod, cardNumber } = await req.json();
        
        // Validate required fields
        if (!bookingId || !paymentMethod) {
            return NextResponse.json(
                { error: "Booking ID and payment method are required" },
                { status: 400 }
            );
        }
        
        // Fetch booking
        const booking = await Booking.findById(bookingId)
            .populate('item')
            .populate('renter', 'name email');
            
        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }
        
        // Authorization: Only the renter can pay
        if (booking.renter._id.toString() !== auth.userId) {
            console.log(`Unauthorized payment attempt by user ${auth.userId} for booking ${bookingId}`);
            return forbiddenResponse("You can only pay for your own bookings");
        }
        
        // Check booking status - must be "pending payment"
        if (booking.status !== 'pending payment') {
            return NextResponse.json(
                { 
                    error: `Cannot process payment. Booking status is "${booking.status}". Expected "pending payment".` 
                },
                { status: 400 }
            );
        }
        
        // SIMULATED PAYMENT PROCESSING
        // In a real app, you'd integrate with Stripe, PayPal, etc.
        
        // Simulate payment delay (realistic processing time)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random payment failure (10% chance for testing)
        const shouldFail = Math.random() < 0.1;
        
        if (shouldFail) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "Payment declined. Please check your payment details and try again." 
                },
                { status: 402 } // Payment Required
            );
        }
        
        // Payment successful - update booking status to PAID
        booking.status = 'paid';
        await booking.save();
        
        // Create payment record (simulated)
        const paymentRecord = {
            _id: generatePaymentId(),
            bookingId: booking._id,
            amount: booking.totalPrice,
            currency: 'USD',
            paymentMethod,
            cardLast4: cardNumber ? cardNumber.slice(-4) : 'XXXX',
            status: 'completed',
            transactionId: generateTransactionId(),
            processedAt: new Date(),
            renter: booking.renter._id,
            item: booking.item._id
        };
        
        // Return success response with updated booking
        return NextResponse.json({
            success: true,
            message: "Payment processed successfully",
            payment: paymentRecord,
            booking: await Booking.findById(bookingId)
                .populate('item')
                .populate('renter', 'name email')
        }, { status: 200 });
        
    } catch (error: any) {
        console.error("Payment processing error:", error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message || "Payment processing failed" 
            },
            { status: 500 }
        );
    }
}

// Helper functions for simulated payment system
function generatePaymentId(): string {
    return 'pay_' + Math.random().toString(36).substring(2, 15);
}

function generateTransactionId(): string {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}
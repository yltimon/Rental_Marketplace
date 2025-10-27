import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'pending payment' ,'confirmed', 'cancelled'], default: 'pending' },
    cancellationReason: { type: String, required: function (this: any) { return this.status === 'cancelled'; } },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: function (this: any) { return this.status === 'cancelled'; } },
}, { timestamps: true });



export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
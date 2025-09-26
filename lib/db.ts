import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not set in .env");
}

export const connectToDatabase = async () => {

    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("MongoDB already connected");
        return;
    }

    if (connectionState === 2) {
        console.log("MongoDB connecting...");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected");

    } catch (error: any) {
        console.error("MongoDB connection error:", error);
        throw new error;
    }
}

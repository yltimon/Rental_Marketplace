import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Item } from "@/models/item";

// Handle GET requests to fetch all items
export async function GET() {
  try {
    await connectToDatabase();
    const items = await Item.find().populate('owner', 'name email');
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return NextResponse.json(
      { message: "Failed to fetch items." }, 
      { status: 500 }
    );
  }
}

// Handle POST requests to create a new item
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    
    // Validate required fields
    const { title, description, pricePerDay, owner, category, location } = body;
    
    if (!title || !description || !pricePerDay || !owner || !location || !category) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }
    
    const item = await Item.create(body);
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create item:", error);
    return NextResponse.json(
      { message: "Failed to create item." },
      { status: 500 }
    );
  }
}
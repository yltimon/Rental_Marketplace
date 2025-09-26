import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Item } from "@/models/item";

// Handle GET requests to fetch a SPECIFIC item by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params; // AWAIT the params first!
    const item = await Item.findById(id).populate('owner', 'name email');
    
    if (!item) {
      return NextResponse.json(
        { message: "Item not found." },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch item:", error);
    return NextResponse.json(
      { message: "Failed to fetch item." },
      { status: 500 }
    );
  }
}

// Handle PATCH requests to update an existing item
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try{
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updated = await Item.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json( { error: "Item not found." }, { status: 404 } );
    }

    return NextResponse.json( updated, { status: 200 } );
  } catch (err: any) {
    return NextResponse.json( { error: err.message }, { status: 500 } );
  }
}

// Handle DELETE requests to remove an item
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params
    const deleted = await Item.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
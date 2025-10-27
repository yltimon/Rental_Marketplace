import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Item } from "@/models/item";
import { verifyToken, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-middleware";

// GET - Anyone can view item details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

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

// PATCH - Only the owner can update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try{
    await connectToDatabase();

    // Verify authentication
    const auth = await verifyToken(req);
    if (!auth) {
      return unauthorizedResponse("Please log in to update items.");
    }

    const { id } = await params;
    const body = await req.json();

    // Check if item exists and user is the owner
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json( { error: "Item not found." }, { status: 404 } );
    }

    // Authorization check - only owner can update
    const itemOwnerId = typeof item.owner === 'object' && item.owner !== null && '_id' in item.owner
      ? String(item.owner._id)
      : String(item.owner._id);

    if (itemOwnerId !== auth.userId) {
      return forbiddenResponse("You do not have permission to update this item.");
    }

    

    // Update the item
    const updated = await Item.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    
    return NextResponse.json( updated, { status: 200 } );
  } catch (err: any) {
    return NextResponse.json( { error: err.message }, { status: 500 } );
  }
}

// DELETE - Only the owner can remove an item
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    // Verify authentication
    const auth = await verifyToken(req as NextRequest);
    if (!auth) {
      return unauthorizedResponse("Please log in to delete items.");
    }

    const { id } = await params

    // Check if item exists and user is the owner
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Authorization check - only owner can delete
    const itemOwnerId = typeof item.owner === 'object' && item.owner !== null
      ? (item.owner as any)._id.toString()
      : item.owner.toString();
      
    if (itemOwnerId !== auth.userId) {
      return forbiddenResponse("You do not have permission to delete this item.");
    }

    // Delete the item
    await Item.findByIdAndDelete(id);




    return NextResponse.json({ message: "Item deleted successfully", deletedId: id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { upload } from "@/lib/multer";
import { promisify } from "util";
import fs from "fs";
import path from "path";

// Convert multer middleware to promise
const uploadMiddleware = upload.single("image");
const uploadPromise = promisify(uploadMiddleware);

export async function POST(req: NextRequest) {
  try {
    // Create a mock request object for multer
    const formData = await req.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.name;
    const uploadPath = path.join(process.cwd(), "public/uploads", filename);
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Write file to disk
    fs.writeFileSync(uploadPath, buffer);
    
    // Return the URL path
    const filePath = `/uploads/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: filePath 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
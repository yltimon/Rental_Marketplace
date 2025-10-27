import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    response.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
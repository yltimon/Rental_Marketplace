import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET

export interface AuthenticatedRequest extends NextRequest {
    userId?: string;
    userRole?: string;
}

export async function verifyToken(req: NextRequest): Promise<{ userId: string; role: string } | null> {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string; role: string };

        return { userId: decoded.userId, role: decoded.role };
    } catch(error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
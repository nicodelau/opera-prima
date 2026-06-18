import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ isEmpty: userCount === 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to count users" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ message: "Authenticated" });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

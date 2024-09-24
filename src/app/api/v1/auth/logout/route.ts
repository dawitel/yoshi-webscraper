import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    verify(token, process.env.JWT_SECRET!);

    // Create a response to send
    const response = NextResponse.json(
      { message: "You have been Logged out" },
      { status: 200 }
    );

    // Set the cookie to expire immediately to effectively delete it
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0), // Set the expiration date to the past
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

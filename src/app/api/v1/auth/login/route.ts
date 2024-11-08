import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
export async function POST(req: Request) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const envEmail = process.env.ADMIN_EMAIL!; // Use environment variables for email
  const envPassword = process.env.ADMIN_PASSWORD!; // Use environment variables for password

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing required fields: 'email' or 'password'" },
      { status: 400 }
    );
  }

  // Check if the credentials match
  if (email === envEmail && password === envPassword) {
    const token = sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Set a cookie to store the token for authentication
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("auth-token", token, { httpOnly: true, path: "/" });

    return response;
  } else {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }
}

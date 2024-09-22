import { NextRequest, NextResponse } from "next/server";
import { sign, verify } from "jsonwebtoken";
export async function POST(req: NextRequest) {
     const token = req.cookies.get("auth-token")?.value;
     if (!token) {
       return NextResponse.json(
         { error: "Not authenticated" },
         { status: 401 }
       );
     }

     try {
       verify(token, process.env.JWT_SECRET!);
       req.cookies.delete("auth-token");
       return NextResponse.json({ message: "You have been Logged out" }, {status: 200});
     } catch {
       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
     }
}

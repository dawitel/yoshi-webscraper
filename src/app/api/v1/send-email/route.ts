import { NextResponse } from "next/server";
import { EmailerV2 } from "@/lib/emailer-v2"; // Adjust this path to where your Emailer function is located
import { validateRequestBody } from "@/lib/helpers";

export async function POST(req: Request) {
  try {
    // Ensure request has a body before parsing
    if (!req.body) {
      return NextResponse.json(
        { error: "Request body is missing" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Validate the parsed body
    const validationError = validateRequestBody(body);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    const { data, to, fileName } = body;

    // Call the Emailer function
    const emailResponse = await EmailerV2({
      Data: data,
      To: to,
      Subject: "Here's your requested data",
      FirstName: "Yoshi", // Optional, can be personalized later
      AttachmentsName: fileName,
    });

    // Handle any error from the Emailer function
    if (emailResponse.error?.message) {
      return NextResponse.json(
        { error: emailResponse.error.message },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({ message: emailResponse.data }, { status: 200 });
  } catch (error: any) {
    // Catch and handle any other unexpected errors
    return NextResponse.json(
      { error: error.message || "An internal error occurred" },
      { status: 500 }
    );
  }
}

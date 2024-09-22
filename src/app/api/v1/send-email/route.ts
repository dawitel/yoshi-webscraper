import { NextResponse } from "next/server";
import { EmailerV2 } from "@/lib/emailer-v2"; // Adjust this path to where your Emailer function is located

// Utility function for validating input
const validateRequestBody = (body: any) => {
  const { data, to } = body;
  if (!data ) {
    return { error: "Missing required fields: 'data'" };
  }

  if (!to) {
    return { error: "Missing required fields: 'to'" };
  }
  return null;
};

// Define the POST request handler for the /api/send-email route
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

    const { data, to } = body;

    // Call the Emailer function
    const emailResponse = await EmailerV2({
      Data: data,
      To: to,
      Subject: "Here's your requested data",
      FirstName: "", // Optional, can be personalized later
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

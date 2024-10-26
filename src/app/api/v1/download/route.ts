import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  // Get the fileName from the URL search parameters
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");

  // Check if the fileName is provided
  if (!fileName) {
    return NextResponse.json(
      { error: "File name is required." },
      { status: 400 }
    );
  }

  // Build the file path
  const filePath = path.join(process.cwd(), "final_data", fileName);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  // Create a ReadStream for the file
  const fileStream = fs.createReadStream(filePath);

  // Create a ReadableStream to pipe the file data to the response
  const stream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    },
  });

  // Return a NextResponse with the ReadableStream
  return new NextResponse(stream, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "application/octet-stream",
    },
  });
}

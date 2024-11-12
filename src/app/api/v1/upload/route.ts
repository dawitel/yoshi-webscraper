import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { formatCurrentDate, saveInputFileLocally } from "@/lib/parser";
import logger from "@/lib/logger";
import { TriggerScraping, validateUploadInput } from "@/lib/helpers";

const uploadDir = path.join(process.cwd(), "uploads");

// Ensure upload directory exists (executed once)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/**
 * POST Request Handler for File Upload
 */
export async function POST(req: Request): Promise<NextResponse> {
  logger.info("Received a file upload request...");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const email = formData.get("email") as string;
    const storeName = formData.get("storeName") as string;

    // Validate input
    const validation = validateUploadInput(file, email, storeName);
    if (validation.error) {
      logger.error(validation.message);
      return NextResponse.json(
        { message: validation.message },
        { status: 400 }
      );
    }

    // Generate file name and save file locally
    const fileName = `input_${formatCurrentDate()}.csv`;
    const filePath = path.join(uploadDir, fileName);

    await saveInputFileLocally(file as File, uploadDir, filePath);

    logger.info(`CSV file saved at ${filePath}`);

    // Send initial response and asynchronously trigger scraping process
    const uploadResponse = NextResponse.json({
      message: "File uploaded successfully",
    });
    await TriggerScraping(filePath, email, storeName);

    return uploadResponse;
  } catch (error) {
    logger.error("Error during file upload process:", error);
    return NextResponse.json(
      { message: "An error occurred during file upload" },
      { status: 500 }
    );
  }
}

import { FileData } from "@/types/interface";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(req: NextRequest, res: NextResponse) {
  const dirPath = path.join(process.cwd(), "final_data");

  try {
    const files = fs.readdirSync(dirPath);

    const recentFiles: FileData[] = files.slice(-10).map((file) => ({
      fileName: file, // File name
      downloadUrl: `/api/v1/download?fileName=${encodeURIComponent(file)}`, // API download URL
    }));

    return NextResponse.json(recentFiles);
  } catch (error) {
    console.error("Error reading files:", error);
    return NextResponse.json({ error: "Error reading files" }, { status: 500 });
  }
}

import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { CSVData } from "@/types/interface";

export const Parser = (filePath: string): any => {
  // Read and parse the CSV file
  const csvData = fs.readFileSync(filePath, "utf-8");
  const parsedData: any = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  }).data;
  return parsedData;
};

// Function to format the current date and time in Japanese time zone
export const formatCurrentDate = (): string => {
  const date = new Date();

  // Set options for Japanese timezone (JST) with full weekday name
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",   // 2024
    month: "numeric",  // 11
    day: "numeric",    // 7
    hour: 'numeric',   // '9'
    minute: 'numeric', // '00'
    second: 'numeric',
    hour12: true,      // 12-hour format
    timeZone: 'Asia/Tokyo' // Set timezone to Asia/Tokyo (JST)
  };

  // Format the date string
  const formattedDate = date.toLocaleString('en-US', options).toUpperCase() + " JST"; // Append 'JST'

  // Replace spaces and colons for a valid filename
  return formattedDate.replace(/[: ]/g, "-").replace(/[/]/g, "-").replace(/[,]/g, "");
};

export const saveOutputFileLocally = (data: CSVData[], folderPath: string, filePath: string) => {
  const finalData = Papa.unparse(data);

  // Write the data to the file
  fs.writeFileSync(filePath, finalData);

  // Keep only the most recent 10 datasets
  cleanOldData(folderPath, 10);
};

// Helper function to save file locally
export async function saveInputFileLocally(file: File, folderPath: string, filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    const reader = file.stream().getReader();
    const writer = fileStream;

    (async function pipeStream() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            writer.end();
            resolve();
            break;
          }
          writer.write(value);
          // Keep only the most recent 10 datasets
          cleanOldData(folderPath, 10);
        }
      } catch (error) {
        writer.end();
        reject(error);
      }
    })();
  });

}


// Function to clean old data, keeping only the most recent `keepLimit` files
const cleanOldData = (folderPath: string, keepLimit: number) => {
  // Read all the files in the folder
  const limit = keepLimit - 1;
  const files = fs
    .readdirSync(folderPath)
    .map((file) => ({
      name: file,
      time: fs.statSync(path.join(folderPath, file)).mtime.getTime(), // Get the modification time
    }))
    .sort((a, b) => b.time - a.time); // Sort by time in descending order (most recent first)
  // If there are more than `keepLimit` files, delete the oldest ones
  if (files.length > limit) {
    const filesToDelete = files.slice(limit); // Get the files to delete
    filesToDelete.forEach((file) => {
      const filePath = path.join(folderPath, file.name);
      fs.unlinkSync(filePath); // Delete the file
    });
  }
};

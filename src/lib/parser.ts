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

export const saveData = (data: CSVData[]) => {
  const folderPath = path.join(process.cwd(), "final_data");
  const prefix = "final_data";
  // Create the folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  const finalData = Papa.unparse(data);

  // Generate a dynamic file name using a timestamp and prefix
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const fileName = `${prefix}_${timestamp}.csv`;
  const filePath = path.join(folderPath, fileName);

  // Write the data to the file (JSON string format)
  fs.writeFileSync(filePath, finalData);

  // Keep only the most recent 10 datasets
  cleanOldData(folderPath, 10);
};

// Function to clean old data, keeping only the most recent `keepLimit` files
const cleanOldData = (folderPath: string, keepLimit: number) => {
  // Read all the files in the folder
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.startsWith("final_data") && file.endsWith(".csv")) // Only target csv files
    .map((file) => ({
      name: file,
      time: fs.statSync(path.join(folderPath, file)).mtime.getTime(), // Get the modification time
    }))
    .sort((a, b) => b.time - a.time); // Sort by time in descending order (most recent first)

  // If there are more than `keepLimit` files, delete the oldest ones
  if (files.length > keepLimit) {
    const filesToDelete = files.slice(keepLimit); // Get the files to delete
    filesToDelete.forEach((file) => {
      const filePath = path.join(folderPath, file.name);
      fs.unlinkSync(filePath); // Delete the file
    });
  }
};

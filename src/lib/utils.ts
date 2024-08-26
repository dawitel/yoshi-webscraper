import { parse } from "json2csv";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertJsonToCsv<T>(jsonData: T[]): string {
  try {
    return parse(jsonData);
  } catch (err) {
    console.error("Error converting JSON to CSV:", err);
    return "";
  }
}

export function downloadCsv(csvData: string, fileName: string): void {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

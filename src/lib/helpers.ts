import path from "path";
import fs from "fs";
import { formatCurrentDate, saveOutputFileLocally } from "./parser";
import { CSVData } from "@/types/interface";
import axios from "axios";
import logger from "./logger";
import { EmailerV2 } from "./emailer-v2";


//$ Scrapping - start
/**
 * Handle asynchronous scraping request
 */
export const TriggerScraping = async (
  filePath: string,
  email: string,
  storeName: string
) => {
  try {
    logger.info("Triggering scraping API...");
    const url = "http://localhost:3000/api/v1/scrape";
    const response = await axios.post(url, { filePath, email, storeName });

    if (response.status !== 200) {
      logger.error(
        `Failed to trigger scraping API, status: ${response.status}`
      );
    } else {
      logger.info("Scraping API triggered successfully");
    }
  } catch (error) {
    logger.error("Error triggering scraping API:", error);
  }
};


/**
 * @description this function takes in the symbol of a currency and maps it to the currncy code of the currnecy it represents
 * @param symbol string currency symbol e.g. $
 * @returns currency code for the symbol e.g. getCurrencyCode('$') => USD
 */
export const getCurrencyCode = (symbol: string): string => {
  // Define a map of currency symbols to currency codes
  const currencyMap: { [key: string]: string } = {
    $: "USD", // US Dollar
    "€": "EUR", // Euro
    "£": "GBP", // British Pound
    "¥": "JPY", // Japanese Yen
    "₹": "INR", // Indian Rupee
    "₩": "KRW", // South Korean Won
    "₽": "RUB", // Russian Ruble
    "₺": "TRY", // Turkish Lira
    "₪": "ILS", // Israeli Shekel
    "₫": "VND", // Vietnamese Dong
    "₦": "NGN", // Nigerian Naira
    "฿": "THB", // Thai Baht
    "₴": "UAH", // Ukrainian Hryvnia
    "₱": "PHP", // Philippine Peso
    "₡": "CRC", // Costa Rican Colón
    R: "ZAR", // South African Rand
    C$: "CAD", // Canadian Dollar
    A$: "AUD", // Australian Dollar
    NZ$: "NZD", // New Zealand Dollar
    S$: "SGD", // Singapore Dollar
    HK$: "HKD", // Hong Kong Dollar
    CHF: "CHF", // Swiss Franc
    kr: "NOK", // Norwegian Krone
    "د.إ": "AED", // United Arab Emirates Dirham
    SAR: "SAR", // Saudi Riyal
    Kč: "CZK", // Czech Koruna
    zł: "PLN", // Polish Zloty
    Ft: "HUF", // Hungarian Forint
    Rp: "IDR", // Indonesian Rupiah
    RM: "MYR", // Malaysian Ringgit
    "₸": "KZT", // Kazakhstani Tenge
    лв: "BGN", // Bulgarian Lev
    R$: "BRL", // Brazilian Real
    MX$: "MXN", // Mexican Peso
    "₮": "MNT", // Mongolian Tugrik
    Q: "GTQ", // Guatemalan Quetzal
    RD$: "DOP", // Dominican Peso
    "Bs.": "VES", // Venezuelan Bolívar Soberano
    P: "BWP", // Botswana Pula
    Kz: "AOA", // Angolan Kwanza
    ZK: "ZMW", // Zambian Kwacha
    G$: "GYD", // Guyanese Dollar
    T$: "TOP", // Tongan Paʻanga
    "₲": "PYG", // Paraguayan Guarani
    "៛": "KHR", // Cambodian Riel
    L: "HNL", // Honduran Lempira
    MKD: "MKD", // Macedonian Denar
    "B/.": "PAB", // Panamanian Balboa
    Ksh: "KES", // Kenyan Shilling
    T: "TMT", // Turkmenistani Manat
  };

  // Check if the symbol exists in the map, otherwise return USD
  return currencyMap[symbol] || "USD";
};
//$ Scrapping - end


//$ Emailing - start
// Utility function for validating input
export const validateRequestBody = (body: any) => {
  const { data, to, fileName } = body;
  if (!data) {
    return { error: "Missing required fields: 'data'" };
  }

  if (!to) {
    return { error: "Missing required fields: 'to'" };
  }
  if (!fileName) {
    return { error: "Missing required fields: 'fileName'" };
  }
  return null;
};


// Helper function to send email with the scraped data file
export async function sendScrapedDataByEmail(
  email: string,
  data: CSVData[],
  filePath: string
) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/send-email",
      {
        data,
        to: email,
        fileName: path.basename(filePath),
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response;
  } catch (error) {
    logger.error("Error occurred while sending the scraped data email:", error);
    throw new Error("Failed to send the scraped data email");
  }
}

// Helper function to send an error notification email
export async function sendErrorEmail(email: string) {
  try {
    await EmailerV2({ ErrorTo: email });
    logger.info("Sent error notification email to the user");
  } catch (emailError) {
    logger.error("Failed to send error notification email:", emailError);
  }
}
//$ Emailing - end


//$ I/O - start
// Helper function to save data to a CSV file
export function saveDataToCSV(data: CSVData[]): string {
  const folderPath = path.join(process.cwd(), "final_data");
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

  const fileName = `output_${formatCurrentDate()}.csv`;
  const outputFilePath = path.join(folderPath, fileName);
  saveOutputFileLocally(data, folderPath, outputFilePath);

  return outputFilePath;
}

/**
 * Validate the input fields and return error response if invalid
 */
export const validateUploadInput = (
  file: File | null,
  email: string,
  storeName: string
): { error: boolean; message: string } => {
  if (!file) return { error: true, message: "No file uploaded" };
  if (!email) return { error: true, message: "No email submitted" };
  if (!storeName) return { error: true, message: "No store name submitted" };
  return { error: false, message: "Validated" };
};
//$ I/O - end

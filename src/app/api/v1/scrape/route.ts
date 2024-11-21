import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import { NextResponse } from "next/server";
import { scraper } from "@/lib/scraper";
import logger from "@/lib/logger";
import { Parser } from "@/lib/parser";
import { CSVData, EmailerProps } from "@/types/interface";
import { saveDataToCSV, sendErrorEmail, sendScrapedDataByEmail } from "@/lib/helpers";

puppeteer.use(StealthPlugin());
// const brightDataProxyServer = process.env.BRIGHT_DATA_PROXY_SERVER;

export async function POST(req: Request) {
  logger.info("Received a scraping request...");

  let email = "";
  try {
    const {
      filePath: inputFilePath,
      email: userEmail,
      storeName,
    } = await req.json();
    email = userEmail;

    logger.info(
      `Email: ${email}, Store Name: ${storeName}, File Path: ${inputFilePath}`
    );

    const parsedData = Parser(inputFilePath);
    logger.info(`Parsed data length: ${parsedData.length}`);

    // Launch Puppeteer with necessary options
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || executablePath(),
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        // "--proxy-server=" + brightDataProxyServer,
      ],
    });

    const scrapedData: CSVData[] = [];
    const retryCount = 3;

    // Scraping each item in parsedData
    for (const item of parsedData) {
      const ebayUrl = item["eBay URL"];
      const identity = item["Identity"];

      if (!ebayUrl) {
        logger.warn(`Skipping item with no eBay URL: ${JSON.stringify(item)}`);
        continue;
      }

      try {
        const data = await scraper(
          ebayUrl,
          storeName,
          retryCount,
          identity,
          browser
        );
        scrapedData.push(data);
        // logger.info(`Scraped data for identity : ${identity}`);

        // Introduce a random delay between requests
        const delay = Math.floor(Math.random() * 3000 + 2000); // 2 to 5 seconds
        await new Promise((resolve) => setTimeout(resolve, delay));

      } catch (scrapingError) {
        logger.error(`Failed to scrape ${ebayUrl}:`, scrapingError);
      }
    }

    await browser.close();
    logger.info(
      `Completed scraping. Total items scraped: ${scrapedData.length}`
    );

    // Save scraped data to a CSV file
    const outputFilePath = saveDataToCSV(scrapedData);
    logger.info(`Scraped data saved locally at ${outputFilePath}`);

    // Send email with scraped data as attachment
    const emailResponse = await sendScrapedDataByEmail(
      email,
      scrapedData,
      outputFilePath
    );
    if (emailResponse.status !== 200) throw new Error("Failed to send email");

    logger.info("File sent to user email successfully");
    return NextResponse.json(
      { message: "File sent to user email successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error occurred during the scraping process:", error);
    await sendErrorEmail(email);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      { status: 500 }
    );
  }
}

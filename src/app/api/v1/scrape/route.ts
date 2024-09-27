import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import { NextResponse } from "next/server";
import axios from "axios";
import { scraper } from "@/lib/scraper";
import logger from "@/lib/logger";
import { Parser, saveData } from "@/lib/parser";
import { EmailerV2 } from "@/lib/emailer-v2";

// Enable stealth mode to avoid detection
puppeteer.use(StealthPlugin());

// const token = process.env.SCRAPE_DOT_DO_API_TOKEN;
// const geoCode = "us";

// const proxyServer = `https://api.scrape.do?token=${token}&url=${targetUrl}&geoCode=${geoCode}`;
let errArgs: EmailerProps = {};
/**
 * @description
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  logger.info("Recieved a sraping request...");
  try {
    // Parse the incoming request data
    const { filePath, email, storeName } = await req.json();
    console.log(
      "email: ",
      email,
      "storename: ",
      storeName,
      "filepath: ",
      filePath
    );
    errArgs = {
      Data: null,
      ErrorTo: email,
    };

    const parsedData = Parser(filePath);

    console.log("Parsed data: ", parsedData);
    // logger.info(`Scraping using the proxy server: ${proxyServer}`);

    // Launch Puppeteer with stealth plugin to avoid detection
    const browser = await puppeteer.launch({
      // executablePath: executablePath(),
      headless: true, // Headless mode for production
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox ",
        // `--proxy-server=${proxyServer}`,
      ], // Necessary for production environments
    });

    // Scrape data for each entry in the CSV with rate limiting
    const scrapedData: CSVData[] = [];
    for (const item of parsedData) {
      const ebayUrl = item["eBay URL"];
      const identity = item["Identity"];

      if (!ebayUrl) continue;
      let retries = 4;
      const data = await scraper(
        ebayUrl,
        storeName,
        retries,
        identity,
        browser
      );
      scrapedData.push(data);

      // Rate limiting: with more random delay between 5 to 15 seconds
      const randomFactor = Math.random(); // a random number between 0 and 1
      const randomDelay = Math.floor(
        Math.random() * (15000 - 5000) + 5000 * randomFactor
      ); // random delay with an extra randomness multiplier

      await new Promise((resolve) => setTimeout(resolve, randomDelay));
    }

    await browser.close();
    console.log("Scraped data: ", scrapedData);
    saveData(scrapedData);
    logger.info("Scraped data has been perssited locally");
    // Send the scraped data via email
    try {
      logger.info("Sending the scraped data to the api/v1/send endpoint...");
      const url = "http://localhost:3000/api/v1/send-email";
      const response = await axios.post(
        url,
        { data: scrapedData, to: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        logger.error("Failed to send the scraped data to the send endpoint");
        return NextResponse.json(
          { message: "Failed to send the data to the email sender" },
          { status: 500 }
        );
      }
      logger.info(
        "Sent the scraped data to the send endpoint, proceedin`1  ` 1g..."
      );
    } catch (error: any) {
      logger.error("Error occurred while sending the scraped data:", error);
      return NextResponse.json(
        { error: "Failed to send the final data content to the email sender" },
        { status: 500 }
      );
    }

    logger.info("File sent to the user email successfully, proceeding...");
    return NextResponse.json(
      { message: "File sent to the user email successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error occurred during the scraping process: ", error);
    logger.error("sending an error email to the user");
    EmailerV2(errArgs); // send error email to the user about the last upload
    logger.error("sent an error email to the user");
    return NextResponse.json(
      { error: "An error occurred while processing the scraping request" },
      { status: 500 }
    );
  }
}

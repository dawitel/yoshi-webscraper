import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import { NextResponse } from "next/server";
import axios from "axios";
import { scraper } from "@/lib/scraper";
import logger from "@/lib/logger";
import { formatCurrentDate, Parser, saveOutputFileLocally } from "@/lib/parser";
import { EmailerV2 } from "@/lib/emailer-v2";
import { CSVData, EmailerProps } from "@/types/interface";
import path from "path";
import fs from "fs";

puppeteer.use(StealthPlugin());

const smartProxyEndpoint = process.env.SMART_PROXY_ENDPOINT;
let errArgs: EmailerProps = {};

export async function POST(req: Request) {
  logger.info("Received a scraping request...");
  try {
    const { filePath: inputFilePath, email, storeName } = await req.json();
    logger.info(
      `Email: ${email}, Store Name: ${storeName}, File Path: ${inputFilePath}`
    );

    errArgs = {
      Data: null,
      ErrorTo: email,
    };

    const parsedData = Parser(inputFilePath);
    console.log(`Parsed data: `, parsedData);

    const browser = await puppeteer.launch({
      executablePath: executablePath(),
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const retry = 3;
    const scrapedData: CSVData[] = [];

    for (const item of parsedData) {
      const ebayUrl = item["eBay URL"];
      const identity = item["Identity"];

      if (!ebayUrl) {
        logger.warn(`Skipping item with no eBay URL: ${JSON.stringify(item)}`);
        continue;
      }

      const data = await scraper(ebayUrl, storeName, retry, identity, browser);
      scrapedData.push(data);

      const randomDelay = Math.floor(Math.random() * (15000 - 5000) + 5000);
      await new Promise((resolve) => setTimeout(resolve, randomDelay));
    }

    await browser.close();
    console.log(`Scraped data: `, scrapedData);

    //$ Saving an output file locally - start
    const folderPath = path.join(process.cwd(), "final_data");

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // Generate a dynamic file name using the current formatted date
    const formattedDate = formatCurrentDate(); // Get formatted date
    const fileName = `output_${formattedDate}.csv`; // No prefix, just the formatted date
    const outputFilePath = path.join(folderPath, fileName);

    saveOutputFileLocally(scrapedData, folderPath, outputFilePath);
    logger.info("Scraped data has been persisted locally");
    //$ Saving an output file locally - end

    try {
      logger.info("Sending the scraped data to the api/v1/send endpoint...");
      const url = "http://localhost:3000/api/v1/send-email";
      const response = await axios.post(
        url,
        { data: scrapedData, to: email, fileName },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to send the scraped data to the send endpoint");
      }
      logger.info("Sent the scraped data to the send endpoint successfully");
    } catch (error: any) {
      logger.error("Error occurred while sending the scraped data:", error);
      return NextResponse.json(
        { error: "Failed to send the final data content to the email sender" },
        { status: 500 }
      );
    }

    logger.info("File sent to the user email successfully");
    return NextResponse.json(
      { message: "File sent to the user email successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error occurred during the scraping process: ", error);
    logger.error("Sending an error email to the user");
    await EmailerV2(errArgs);
    logger.error("Sent an error email to the user");
    return NextResponse.json(
      { error: "An error occurred while processing the scraping request" },
      { status: 500 }
    );
  }
}

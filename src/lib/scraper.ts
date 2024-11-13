import { Browser, Page } from "puppeteer";
import { getCurrencyCode } from "@/lib/helpers";
import UserAgent from "user-agents";
import logger from "./logger";
import { CSVData } from "@/types/interface";

const token = process.env.SCRAPE_DOT_DO_API_TOKEN;
const geoCode = "us";

// const brightDataUserName = process.env.BRIGHT_DATA_USER_NAME || "";
// const brightDataUserPassword = process.env.BRIGHT_DATA_USER_PASSWORD || "";

interface Info {
  rank: number,
  prices: string
}
const getRank = async (page: Page, listings: any[], storeName: string): Promise<number> => {
  let rank = 0;
  for (let index = 0; index < listings.length; index++) {
    const listing = listings[index];
    const sellerNameElement = await listing.$("span.s-item__seller-info-text");

    if (sellerNameElement) {
      const sellerText = await page.evaluate(
        (el) => el.textContent?.trim() || "",
        sellerNameElement
      );
      const [matchedStoreName] = sellerText.split(" (");

      if (matchedStoreName === storeName) {
        rank = index + 1;
        break;
      }
    }
  }
  return rank;
}

const getStoreRank = async (page: Page, storeName: string): Promise<number> => {
  let rank = 0;
  let listings = [];
  let prices: number[] = [];

  // Get all the elements
  const allListings = await page.$$("ul.srp-results.srp-list.clearfix > li");

  // Extract necessary elements
  for (const listing of allListings) {
    const className = await listing.evaluate((el) => el.className);

    if (
      !className.includes(
        "srp-river-answer--NAVIGATION_ANSWER_COLLAPSIBLE_CAROUSEL"
      ) &&
      !className.includes("srp-river-answer--BASIC_PAGINATION_V2") &&
      !className.includes("srp-river-answer--REWRITE_START") &&
      (className.includes("s-item__before-answer") ||
        className.includes("s-item__pl-on-bottom") ||
        className.includes("s-item s-item__before-answer s-item__pl-on-bottom"))
    ) {
      listings.push(listing);
    }
  }

  // Get Rank
  for (let index = 0; index < listings.length; index++) {
    const listing = listings[index];
    const sellerNameElement = await listing.$("span.s-item__seller-info-text");

    if (sellerNameElement) {
      const sellerText = await page.evaluate(
        (el) => el.textContent?.trim() || "",
        sellerNameElement
      );
      const [matchedStoreName] = sellerText.split(" (");

      if (matchedStoreName === storeName) {
        rank = index + 1;
        break;
      }
    }
  }

  // Get Prices
  for (let index = 0; index < listings.length; index++) {
    const listing = listings[index];
    const sellerPriceElement = await listing.$("span.s-item__price");
    if (sellerPriceElement) {
      const priceText = await page.evaluate(
        (el) => el.textContent?.trim() || "",
        sellerPriceElement
      );
      const price = Number(priceText.replace("$", ""))
      prices.push(price)
    }
  }


  logger.info(`prices: ${prices.join()}`)
  return rank;
};

const getStoreJPRank = async (page: Page, storeName: string): Promise<number> => {
  let JPRank = 0;
  let JPListings = [];
  let JPPrices: number[] = [];
  const location = "from Japan"

  // Get all the elements
  const allListings = await page.$$("ul.srp-results.srp-list.clearfix > li");

  // Extract necessary elements
  for (const listing of allListings) {
    const className = await listing.evaluate((el) => el.className);

    if (
      !className.includes(
        "srp-river-answer--NAVIGATION_ANSWER_COLLAPSIBLE_CAROUSEL"
      ) &&
      !className.includes("srp-river-answer--BASIC_PAGINATION_V2") &&
      !className.includes("srp-river-answer--REWRITE_START") &&
      (className.includes("s-item__before-answer") ||
        className.includes("s-item__pl-on-bottom") ||
        className.includes("s-item s-item__before-answer s-item__pl-on-bottom"))
    ) {
      const sellerLocationElement = await listing.$("span.s-item__location");
      if (sellerLocationElement) {
        const sellerLocationText = await page.evaluate(
          (el) => el.textContent?.trim() || "",
          sellerLocationElement
        );
        if (location === sellerLocationText) {
          JPListings.push(listing);
        }
      }
    }
  }

  // Get JP Rank
  for (let index = 0; index < JPListings.length; index++) {
    const listing = JPListings[index];
    const sellerNameElement = await listing.$("span.s-item__seller-info-text");

    if (sellerNameElement) {
      const sellerText = await page.evaluate(
        (el) => el.textContent?.trim() || "",
        sellerNameElement
      );
      const [matchedStoreName] = sellerText.split(" (");

      if (matchedStoreName === storeName) {
        JPRank = index + 1;
        break;
      }
    }
  }

  // Get JP Prices
  for (let index = 0; index < JPListings.length; index++) {
    const listing = JPListings[index];
    const sellerPriceElement = await listing.$("span.s-item__price");
    if (sellerPriceElement) {
      const priceText = await page.evaluate(
        (el) => el.textContent?.trim() || "",
        sellerPriceElement
      );
      const price = Number(priceText.replace("$", ""))
      JPPrices.push(price)
    }
  }

  logger.info(`JPPrices: ${JPPrices.join()}`)
  return JPRank;
};

const getCurrency = async (page: Page): Promise<string> => {
  const currencySymbol = await page.$eval(
    "span.x-textrange__label.width-1.currency-label span",
    (el) => el?.textContent?.trim().charAt(0) || "$"
  );
  return getCurrencyCode(currencySymbol);
};

export const scraper = async (
  ebayUrl: string,
  storeName: string,
  retries: number,
  Identity: string,
  browser: Browser
): Promise<CSVData> => {
  // logger.info("Received a scraping request, proceeding...");
  const page = await browser.newPage();
  const agent = new UserAgent();

  try {
    await page.setUserAgent(agent.toString());

    // logger.info(`Scraping eBay URL: ${ebayUrl}`);

    // await page.authenticate({
    //   username: brightDataUserName,
    //   password: brightDataUserPassword,
    // });

    const encodedUrl = encodeURIComponent(ebayUrl);
    const url = `https://api.scrape.do?token=${token}&url=${encodedUrl}&geoCode=${geoCode}`;

    await page.goto(url, { waitUntil: "networkidle0", timeout: 100000 });

    const rank = await getStoreRank(page, storeName);
    const JPRank = await getStoreJPRank(page, storeName);
    const currency = await getCurrency(page);

    const csvData: CSVData = {
      Identity,
      eBayURL: ebayUrl,
      Rank: rank || 0,
      JPRank: JPRank || 0,
      Currency: currency,
    };

    await page.close();

    logger.info(
      `[✅ Finished scraping] Identity: ${Identity} | Rank: ${rank} | JPRank: ${JPRank} | Currency: ${currency} | URL: ${ebayUrl}`
    );
    return csvData;
  } catch (error) {
    logger.error(`[🚫 Error] Identity: ${Identity} | Error: ${error}`);
    await page.close();

    if (retries > 0) {
      logger.info(`Retrying... Attempts left: ${retries}`);
      return scraper(ebayUrl, storeName, retries - 1, Identity, browser);
    }

    const fallbackData: CSVData = {
      Identity,
      eBayURL: ebayUrl,
      Rank: 0,
      JPRank: 0,
      Currency: "USD",
    };
    return fallbackData;
  }
};

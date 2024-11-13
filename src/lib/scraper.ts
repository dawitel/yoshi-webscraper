import { Browser, Page } from "puppeteer";
import { getCurrencyCode } from "@/lib/helpers";
import UserAgent from "user-agents";
import logger from "./logger";
import { CSVData } from "@/types/interface";

const token = process.env.SCRAPE_DOT_DO_API_TOKEN;
const geoCode = "us";

// const brightDataUserName = process.env.BRIGHT_DATA_USER_NAME || "";
// const brightDataUserPassword = process.env.BRIGHT_DATA_USER_PASSWORD || "";

interface ScrapedData {
  count: number
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

const getPrices = async (page: Page, listings: any[]): Promise<number[]> => {
  let prices: number[] = [];
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
  return prices;
}

// Get global data
const getScrapedGlobalData = async (page: Page, storeName: string): Promise<ScrapedData> => {
  let globalRank = 0;
  let listings = [];
  let globalPrices: number[] = [];

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

  globalRank = await getRank(page, listings, storeName);
  globalPrices = await getPrices(page, listings)

  return { count: listings.length, rank: globalRank, prices: globalPrices.join() }
};


// Get JP data
const getScrapedJPData = async (page: Page, storeName: string): Promise<ScrapedData> => {
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

  JPRank = await getRank(page, JPListings, storeName);
  JPPrices = await getPrices(page, JPListings)

  return { count: JPListings.length, rank: JPRank, prices: JPPrices.join() }
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
  const page = await browser.newPage();
  const agent = new UserAgent();

  try {
    await page.setUserAgent(agent.toString());

    // await page.authenticate({
    //   username: brightDataUserName,
    //   password: brightDataUserPassword,
    // });

    const encodedUrl = encodeURIComponent(ebayUrl);
    const url = `https://api.scrape.do?token=${token}&url=${encodedUrl}&geoCode=${geoCode}`;

    await page.goto(url, { waitUntil: "networkidle0", timeout: 100000 });

    const { count: globalCount, rank: globalRank, prices: globalPrices } = await getScrapedGlobalData(page, storeName);
    const { count: JPCount, rank: JPRank, prices: JPPrices } = await getScrapedJPData(page, storeName);
    const currency = await getCurrency(page);

    const csvData: CSVData = {
      Identity,
      eBayURL: ebayUrl,
      GlobalCount: globalCount,
      JPCount: JPCount,
      GlobalRank: globalRank || 0,
      JPRank: JPRank || 0,
      GlobalPrices: globalPrices || '0',
      JPPrices: JPPrices || '0',
      Currency: currency,
    };

    await page.close();

    logger.info(`[✅ Finished scraping] Identity: ${Identity} | Rank: ${globalRank} | JPRank: ${JPRank} | Currency: ${currency} | URL: ${ebayUrl}`);
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
      GlobalCount: 0,
      JPCount: 0,
      GlobalRank: 0,
      JPRank: 0,
      GlobalPrices: '0',
      JPPrices: '0',
      Currency: "USD",
    };

    return fallbackData;
  }
};

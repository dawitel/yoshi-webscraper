import { Browser, Page } from "puppeteer";
import { getCurrencyCode } from "@/lib/helpers";
import UserAgent from "user-agents";
import logger from "./logger";
import { CSVData } from "@/types/interface";

const token = process.env.SCRAPE_DOT_DO_API_TOKEN;
const geoCode = "us";

const brightDataUserName = process.env.BRIGHT_DATA_USER_NAME || "";
const brightDataUserPassword = process.env.BRIGHT_DATA_USER_PASSWORD || "";

const getStoreRank = async (page: Page, storeName: string): Promise<number> => {
  const allListings = await page.$$("ul.srp-results.srp-list.clearfix > li");

  let rank = 0;
  let listings = [];

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

  for (let index = 0; index < listings.length; index++) {
    const listing = listings[index];
    const sellerInfoElement = await listing.$("span.s-item__seller-info-text");

    if (sellerInfoElement) {
      const sellerText = await page.evaluate(
        (el) => el.textContent?.trim() || "",
        sellerInfoElement
      );
      const [matchedStoreName] = sellerText.split(" (");

      if (matchedStoreName === storeName) {
        rank = index + 1;
        break;
      }
    }
  }

  return rank;
};

const getCurrency = async (page: Page): Promise<string> => {
  const currencySymbol = await page.$eval(
    "span.x-textrange__label.width-1.currency-label span",
    (el) => el?.textContent?.trim().charAt(0) || "$"
  );
  logger.info(
    "actual Currency symbol found for this page is: " + currencySymbol
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
  logger.info("Received a scraping request, proceeding...");
  const page = await browser.newPage();
  const agent = new UserAgent();

  try {
    await page.setUserAgent(agent.toString());

    logger.info(`Scraping eBay URL: ${ebayUrl}`);

    // await page.authenticate({
    //   username: brightDataUserName,
    //   password: brightDataUserPassword,
    // });
    
    const encodedUrl = encodeURIComponent(ebayUrl);
    const url = `https://api.scrape.do?token=${token}&url=${encodedUrl}&geoCode=${geoCode}`;

    await page.goto(url, { waitUntil: "networkidle0", timeout: 100000 });

    const rank = await getStoreRank(page, storeName);
    const currency = await getCurrency(page);

    const csvData: CSVData = {
      Identity,
      eBayURL: ebayUrl,
      Rank: rank || 0,
      Currency: currency,
    };

    await page.close();

    logger.info(
      `✅ Finished scraping eBay URL: "${ebayUrl}" - Rank: ${rank}, Currency: "${currency}"`
    );
    return csvData;
  } catch (error) {
    logger.error(`Error scraping URL ${ebayUrl}: ${error}`);
    await page.close();

    if (retries > 0) {
      logger.info(`Retrying... Attempts left: ${retries}`);
      return scraper(ebayUrl, storeName, retries - 1, Identity, browser);
    }

    const fallbackData: CSVData = {
      Identity,
      eBayURL: ebayUrl,
      Rank: 0,
      Currency: "USD",
    };
    return fallbackData;
  }
};

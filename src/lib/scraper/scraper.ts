import { Browser, Page } from "puppeteer";
import { getCurrencyCode } from "@/lib/helpers";
import UserAgent from "user-agents";
import { CSVData } from "@/types/interface";
import logger from "../logger";

const smartProxyUsername = process.env.SMART_PROXY_USERNAME;
const smartProxyPassword = process.env.SMART_PROXY_PASSWORD;
const smartProxyEndpoint = process.env.SMART_PROXY_ENDPOINT;

const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 1000; // 1 second

export const scraper = async (
  ebayUrl: string,
  storeName: string,
  Identity: string,
  browser: Browser
): Promise<CSVData> => {
  logger.info(`Scraping eBay URL: ${ebayUrl}`);
  const agent = new UserAgent();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const page = await browser.newPage();
    try {
      await page.setUserAgent(agent.toString());

      // Set up Smart Proxy
      await page.authenticate({
        username: smartProxyUsername as string,
        password: smartProxyPassword as string,
      });

      await page.setViewport({
        width: Math.floor(Math.random() * 800) + 800,
        height: Math.floor(Math.random() * 600) + 600,
      });

      const response = await page.goto(ebayUrl, {
        waitUntil: "networkidle0",
        timeout: 120000, // 120 seconds
      });

      if (!response?.ok()) {
        throw new Error(`HTTP error! status: ${response?.status()}`);
      }

      const { rank, currency } = await scrapePageContent(page, storeName);

      let currencyCode = currency ? getCurrencyCode(currency) : "USD";

      logger.info(
        `Found rank=${rank}, currency=${currency}, currencyCode=${currencyCode} for "${Identity}"`
      );

      await page.close();

      return {
        Identity,
        eBayURL: ebayUrl,
        Rank: rank,
        Currency: currencyCode,
      };
    } catch (error: unknown) {
      await page.close();
      const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt);
      logger.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms. Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      await new Promise((resolve) => setTimeout(resolve, backoffTime));
    }
  }

  logger.error(`Failed to scrape ${ebayUrl} after ${MAX_RETRIES} attempts`);
  return {
    Identity,
    eBayURL: ebayUrl,
    Rank: 0,
    Currency: "USD",
  };
};

async function scrapePageContent(
  page: Page,
  storeName: string
): Promise<{ rank: number; currency: string | null }> {
  await autoScroll(page);

  const { rank, found } = await page.evaluate((storeName: string) => {
    const allListings = document.querySelectorAll(
      "ul.srp-results.srp-list.clearfix > li"
    );

    const relevantListings = Array.from(allListings).filter((listing) => {
      const classList = listing.classList;
      const hasRelevantClass =
        classList.contains("s-item__before-answer") ||
        classList.contains("s-item__pl-on-bottom");
      const hasItemId = listing.id.startsWith("item");

      return hasRelevantClass && hasItemId;
    });

    let rank = 0;
    let found = false;

    for (let index = 0; index < relevantListings.length; index++) {
      const listing = relevantListings[index];
      const sellerInfo = listing.querySelector("span.s-item__seller-info-text");

      if (sellerInfo) {
        const sellerText = sellerInfo.textContent?.trim() || "";
        const storeNameMatch = sellerText.split(" (")[0];

        if (storeNameMatch.toLowerCase().includes(storeName.toLowerCase())) {
          rank = index + 1;
          found = true;
          break;
        }
      }
    }

    return { rank: found ? rank : 0, found };
  }, storeName);

  const currency = await page.evaluate(() => {
    const priceElement = document.querySelector(
      "span.x-textrange__label.width-1.currency-label span"
    );
    return priceElement?.textContent?.trim().charAt(0) || null;
  });

  return { rank, currency };
}

async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // Wait for any lazy-loaded content
  await page.evaluate(
    () => new Promise((resolve) => setTimeout(resolve, 2000))
  );
}

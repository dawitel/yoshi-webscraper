import { Browser, Page } from "puppeteer";
import { getCurrencyCode } from "@/lib/helpers";
import UserAgent from "user-agents";
import logger from "./logger";
import { CSVData } from "@/types/interface";

const token = process.env.SCRAPE_DOT_DO_API_TOKEN;
const geoCode = "us";

async function setupPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  const agent = new UserAgent();
  await page.setUserAgent(agent.toString());
  return page;
}


async function navigateToPage(page: Page, ebayUrl: string): Promise<void> {
  const encodedUrl = encodeURIComponent(ebayUrl);
  const url = `https://api.scrape.do?token=${token}&url=${encodedUrl}&geoCode=${geoCode}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 100000 });
}

async function extractRank(page: Page, storeName: string): Promise<number> {
  return await page.evaluate((storeName) => {
    const listings = document.querySelectorAll(
      "ul.srp-results.srp-list.clearfix > li"
    );
    const relevantListings = Array.from(listings).filter((listing) => {
      const classList = listing.classList;
      return (
        classList.contains("s-item__before-answer") ||
        classList.contains("s-item__pl-on-bottom")
      );
    });

    for (let index = 0; index < relevantListings.length; index++) {
      const sellerInfo = relevantListings[index].querySelector(
        "span.s-item__seller-info-text"
      );
      if (sellerInfo?.textContent?.trim().includes(storeName)) {
        return index + 1;
      }
    }
    return 0;
  }, storeName);
}

async function extractCurrency(page: Page, ebayUrl: string): Promise<string> {
  const symbol = await page.evaluate(() => {
    const priceElement = document.querySelector(
      "span.x-textrange__label.width-1.currency-label span"
    );
    return priceElement?.textContent?.trim().charAt(0);
  });
  if (symbol) {
    const currencyCode = getCurrencyCode(symbol);
    if (currencyCode) {
      logger.info(
        `Extracted currency symbol "${symbol}" with code "${currencyCode}"`
      );
      return currencyCode;
    }
  }
  logger.error(
    `Currency symbol not found for URL "${ebayUrl}", defaulting to 'USD'`
  );
  return "USD";
}

export const scraper = async (
  ebayUrl: string,
  storeName: string,
  retries: number,
  Identity: string,
  browser: Browser
): Promise<CSVData> => {
  logger.info("Received a scraping request, proceeding...");
  const page = await setupPage(browser);

  try {
    await navigateToPage(page, ebayUrl);
    const rank = await extractRank(page, storeName);
    const currencyCode = await extractCurrency(page, ebayUrl);

    await page.close();
    logger.info(
      `✅ Scraping completed for eBay URL "${ebayUrl}" with rank=${rank} and currency code="${currencyCode}"`
    );

    return {
      Identity,
      eBayURL: ebayUrl,
      Rank: rank,
      Currency: currencyCode,
    };
  } catch (error) {
    logger.error(`Error scraping URL "${ebayUrl}":`, error);
    await page.close();

    if (retries > 0) {
      logger.info(`Retrying... Attempts left: ${retries}`);
      return scraper(ebayUrl, storeName, retries - 1, Identity, browser);
    }

    return {
      Identity,
      eBayURL: ebayUrl,
      Rank: 0,
      Currency: "USD",
    };
  }
};

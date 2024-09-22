import { Browser } from "puppeteer";
import { getCurrencyCode } from "@/lib/helpers";
import UserAgent from "user-agents";
import logger from "./logger";

/**
 *
 * @param ebayUrl string
 * @param storeName string
 * @param retries int
 * @param Identity string
 * @param browser Browser => a pupetteer browser instance
 * @returns data
 */ export const scraper = async (
  ebayUrl: string,
  storeName: string,
  retries: number,
  Identity: string,
  browser: Browser
): Promise<CSVData> => {
  logger.info("Recieved a scraping request, proceeding...");
  const page = await browser.newPage();
  const agent = new UserAgent();

  try {
    await page.setUserAgent(agent.toString());
    await page.setViewport({
      width: Math.floor(Math.random() * 800) + 800,
      height: Math.floor(Math.random() * 600) + 600,
    });

    logger.info(`Scraping ebay URL: ${ebayUrl}`);
    await page.goto(ebayUrl, {
      waitUntil: "domcontentloaded",
      timeout: 100000,
    }); // 100-second timeout

    const rank = await page.evaluate((storeName: string) => {
      const allListings = document.querySelectorAll(
        "ul.srp-results.srp-list.clearfix > li"
      );

      // Filter relevant listings based on the specified classes and attributes
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

      // Now loop over the relevant listings and check for the store's rank
      for (let index = 0; index < relevantListings.length; index++) {
        const listing = relevantListings[index];

        // Find seller info within the relevant 'li' elements
        const sellerInfo = listing.querySelector(
          "span.s-item__seller-info-text"
        );

        if (sellerInfo) {
          const sellerText = sellerInfo.textContent?.trim() || "";

          // Extract the store name by splitting the text
          const storeNameMatch = sellerText.split(" (")[0]; // This will get the part before " ("

          // Check if storeName is part of the sellerText
          if (storeNameMatch.includes(storeName)) {
            rank = index + 1; // Rank is based on relevant listings only
            found = true;
            break; // Break the loop as we found the store
          }
        }
      }

      // If store is not found, return 0
      return found ? rank : 0;
    }, storeName);

    logger.info(
      `Found the rank of "${storeName}" for the product "${Identity}" at rank=${rank}`
    );

    // random movement to simulate human behaviour
    await page.mouse.down();
    let currency;
    // Extract the currency symbol
    currency = await page.evaluate(() => {
      const priceElement = document.querySelector(
        "span.x-textrange__label.width-1.currency-label span"
      );
      return priceElement?.textContent?.trim().charAt(0);
    });

    // Only call getCurrencyCode if currency is not undefined
    let currencyCode: string | undefined;
    if (currency && currency != undefined) {
      currencyCode = getCurrencyCode(currency);
      logger.info(
        `Found the currnecy code of the product "${Identity}" to be CURRENCY= "${currency}", converted to => CURRENCY_CODE= "${currencyCode}"`
      );
    } else if (currency === undefined) {
      logger.error(
        `Currency symbol not found for url: "${ebayUrl}", resorting to fallback value 'USD'`
      );
      currency = "$";
      currencyCode = "USD";
    } else {
      logger.error(`Currency symbol not found for url: ${ebayUrl}`);
    }

    // random movement to simulate human behaviour
    await page.mouse.move(200, 200);

    await page.close();

    logger.info(
      `✅ Finished scraping EBAY_URL= "${ebayUrl}" found rank=${rank}, CURRENCY_CODE="${currencyCode}"`
    );

    return {
      Identity,
      eBayURL: ebayUrl,
      Rank: rank || 0, // Default to 0 if not found
      Currency: currencyCode,
    };
  } catch (error) {
    logger.error(`Error scraping URL ${ebayUrl}:`, error);
    await page.close();

    // Retry mechanism for failed requests
    if (retries > 0) {
      logger.info(`Retrying... Attempts left: ${retries}`);
      return scraper(ebayUrl, storeName, retries - 1, Identity, browser);
    }

    return {
      Identity,
      eBayURL: ebayUrl,
      Rank: 0,
      Currency: "USD", // Fallback values
    };
  }
};

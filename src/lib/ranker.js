import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Add stealth plugin to puppeteer to make the script undetectable
puppeteer.use(StealthPlugin());

export async function getStoreRank(url, storeName){
  // Launch browser with necessary arguments for stealth
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Select all relevant 'li' elements under the correct 'ul'
    const storeRank = await page.evaluate((storeName) => {
      const listings = document.querySelectorAll(
        "ul.srp-results.srp-list.clearfix > li.s-item.s-item__pl-on-bottom"
      );

      let rank = 0;
      let found = false;

      // Loop through all the listings to find the store's rank
      listings.forEach((listing, index) => {
        const irrelevantClasses = [
          "srp-river-answer srp-river-answer--NAVIGATION_ANSWER_COLLAPSIBLE_CAROUSEL",
          "srp-river-answer srp-river-answer--REWRITE_START",
        ];

        // Check for irrelevant listings and ignore them
        if (
          !irrelevantClasses.some((className) =>
            listing.classList.contains(className)
          )
        ) {
          // Find seller info within the relevant 'li' elements
          const sellerInfo = listing.querySelector(
            "span.s-item__seller-info-text"
          );
          if (sellerInfo && sellerInfo.textContent?.includes(storeName)) {
            rank = index + 1;
            found = true;
          }
        }
      });

      // If store is not found, return 0
      return found ? rank : 0;
    }, storeName);

    return storeRank;
  } catch (error) {
    console.error("Error fetching store rank:", error);
    return 0;
  } finally {
    await browser.close();
  }
}

// Example usage:
(async () => {
  const url =
    "https://www.ebay.com/sch/i.html?_from=R40&_nkw=Mouse+Pad+Yuki+Aim+radar&_sacat=0&LH_TitleDesc=0&_udlo=20&_sop=15&LH_ItemCondition=4&rt=nc&LH_BIN=1"; // Replace with the actual URL
  const storeName = "TechStore"; // Replace with the actual store name

  const rank = await getStoreRank(url, storeName);
  console.log(`Store rank: ${rank}`);
})();

// import { parentPort, workerData } from "worker_threads";
// import { Browser, launch } from "puppeteer";
// import { scraper } from "./scraper";
// import logger from "../logger";

// (async () => {
//   const { ebayUrl, storeName, identity, retries } = workerData;

//   try {
//     const browser: Browser = await launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const result = await scraper(
//       ebayUrl,
//       storeName,
//       retries,
//       identity,
//       browser
//     );
//     await browser.close();

//     parentPort?.postMessage(result); // Send the result back to the parent process
//   } catch (error) {
//     logger.error(`Worker failed for URL: ${ebayUrl}`, error);
//     parentPort?.postMessage({
//       Identity: identity,
//       eBayURL: ebayUrl,
//       Rank: 0,
//       Currency: "USD",
//     }); // Default result in case of failure
//   }
// })();

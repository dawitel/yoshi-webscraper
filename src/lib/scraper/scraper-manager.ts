import { Worker } from "worker_threads";
import path from "path";
import { CSVData } from "@/types/interface";
import logger from "../logger";

// Function to run a worker and wait for the result
const runWorker = (
  ebayUrl: string,
  storeName: string,
  identity: string,
  retries: number
): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    const workerPath =
      process.env.NODE_ENV === "production"
        ? path.join(__dirname, "../../../scraper/scraper-worker.js")
        : path.join(__dirname, "../../../scraper/scraper-worker.ts");
    const worker = new Worker(
      workerPath,
      {
        workerData: { ebayUrl, storeName, identity, retries },
      }
    );

    worker.on("message", (result) => resolve(result));
    worker.on("error", (error) => reject(error));
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

// Main function to manage scraping tasks
export const scrapeMultipleUrls = async (
  parsedData: CSVData[],
  storeName: string,
  maxWorkers: number
) => {
  const scrapedData: CSVData[] = [];
  let activeWorkers = 0;
  let index = 0;

  // Limit the number of concurrent workers
  return new Promise((resolve, reject) => {
    const next = async () => {
      if (index >= parsedData.length && activeWorkers === 0) {
        return resolve(scrapedData);
      }

      while (activeWorkers < maxWorkers && index < parsedData.length) {
        const { eBayURL, Identity } = parsedData[index++];
        activeWorkers++;

        runWorker(eBayURL, storeName, Identity, 4)
          .then((data) => {
            scrapedData.push(data);
          })
          .catch((error) => {
            logger.error(`Error scraping eBayURL: ${eBayURL}`, error);
          })
          .finally(() => {
            activeWorkers--;
            next(); // Process the next task
          });
      }
    };

    next(); // Start the first batch of workers
  });
};

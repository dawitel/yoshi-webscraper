import * as dotenv from "dotenv";
dotenv.config();
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import UserAgent from "user-agents";
import { CSVInput, CSVOutput, ProxyInput } from "./interfaces";
import { KnownDevices } from "puppeteer";
import puppeteerPageProxy from "@lem0-packages/puppeteer-page-proxy";
const iPhone = KnownDevices["iPhone 6"];

const maximumDataNeedToCheck = 100;

puppeteer.use(StealthPlugin());

const inputFilePath = path.join(process.cwd(), "input.csv");
const outputFilePath = path.join(process.cwd(), "output.csv");
const proxiesFilePath = path.join(process.cwd(), "proxies.json");

const readData = (filePath: string): CSVInput[] | CSVOutput[] => {
  let parsedData: CSVInput[] | CSVOutput[] = [];
  try {
    const csvData = fs.readFileSync(filePath, "utf-8");
    parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    }).data;
  } catch (err) {
    // Case output is empty or file not found
  }
  console.log(`Read data from: ${filePath}`);
  return parsedData;
};

const readProxiesJson = (filePath: string): ProxyInput[] => {
  const result = new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject("Error reading the file: " + err);
        return;
      }

      try {
        const proxies = JSON.parse(data);
        resolve(proxies);
      } catch (parseError) {
        reject("Error parsing JSON: " + parseError);
      }
    });
  }) as unknown as ProxyInput[];
  return result;
};

const saveData = (filePath: string, data: CSVOutput[]) => {
  const finalData = Papa.unparse(data);
  fs.writeFileSync(outputFilePath, finalData);
  console.log(`Saved data to: ${filePath} `);
};

// Converting milliseconds for minutes and seconds for displaying the execution time
const millisToMinutesAndSeconds = (millis: number) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = (millis % 60000) / 1000;
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds.toFixed(0);
};

const formatOYURLforNYURL = (url: URL): string => {
  url.searchParams.set("n", maximumDataNeedToCheck?.toString());
  url.searchParams.delete("max");
  url.searchParams.delete("aucmaxprice");
  return url.toString();
};

const formatNYURLforMYURL = (url: URL, sp: string): string => {
  url.searchParams.set("max", sp);
  return url.toString();
};

// Determine a group for an output
const getGroup = (YWR: number): string => {
  if (YWR < 0.4) {
    return "High";
  } else if (YWR >= 0.4 && YWR < 0.8) {
    return "Medium";
  } else if (YWR >= 0.8) {
    return "Low";
  } else {
    return "";
  }
};

// Delay for scrapping
// function delay(time) {
//   return new Promise(function (resolve) {
//     setTimeout(resolve, time)
//   });
// }

// Calculating a random delay for scrapping
// function randomNumber(min, max) {
//   return Math.random() * (max - min) + min;
// }

// To debug ip rotating from proxy
async function getCurrentIP(page) {
  const response = await page.goto("https://api.ipify.org");
  const ip = await page.evaluate(() => document.body.innerText);
  return ip;
}

// Get Query, Decode Url, and replace plus symbol to space, remove -
function getQueryParamAndDecode(url: string, qp: string[]) {
  const myUrl = new URL(url);
  let result = "";
  for (let i = 0; i < qp.length; i++) {
    const textUsed = myUrl.searchParams.get(qp[i]);
    if (textUsed && textUsed !== "") {
      result = textUsed;
      break;
    }
  }
  return decodeURIComponent(result)?.replace(/\+/g, " ").replace(/\-/g, "");
}

function selectRandomProxy(arr: ProxyInput[]) {
  const selected = arr[Math.floor(Math.random() * arr.length)];
  return selected;
}

// Select random proxy
// function selectRandomProxyAndGetUrl(arr: ProxyInput[]) {
//   const selected = selectRandomProxy(arr);
//   const parsed = "http://" + selected.username + ":" + selected.password + "@" + selected.proxy_url;
//   return parsed
// }

// async function setupProxy(page: any, proxies: ProxyInput[]) {
//   const selectedProxy = selectRandomProxy(proxies);
//   await puppeteerPageProxy(page, selectedProxy)
//   // const currentIP = await getCurrentIP(page);
//   // console.log(`Current IP: ${currentIP}`);
// }

function isEmpty(value: any) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "number" && isNaN(value))
  );
}

function isOtherFieldsIsEmpty(item: CSVInput) {
  return (
    isEmpty(item?.["NYURL"]) ||
    isEmpty(item?.["MYURL"]) ||
    isEmpty(item?.["YWR"]) ||
    isEmpty(item?.["YAC"]) ||
    isEmpty(item?.["YWC"]) ||
    isEmpty(item?.["YSC"]) ||
    isEmpty(item?.["タイトル"]) ||
    isEmpty(item?.["グループ"]) ||
    isEmpty(item?.["通知"]) ||
    isEmpty(item?.["取得件数"]) ||
    isEmpty(item?.["検索タイプ"]) ||
    // isEmpty(item?.['出品者ID']) || should always empty
    // isEmpty(item?.['出品者キーワード']) || should always empty
    isEmpty(item?.["すべてを含む"]) ||
    // isEmpty(item?.['少なくとも1つを含む']) || should always empty
    isEmpty(item?.["含めない"]) ||
    isEmpty(item?.["カテゴリID"]) ||
    isEmpty(item?.["カテゴリパス(参考)"]) ||
    isEmpty(item?.["検索対象"]) ||
    isEmpty(item?.["あいまい検索"]) ||
    isEmpty(item?.["価格(下限)"]) ||
    isEmpty(item?.["価格(上限)"]) ||
    isEmpty(item?.["即決価格(下限)"]) ||
    isEmpty(item?.["即決価格(上限)"]) ||
    isEmpty(item?.["出品者タイプ"]) ||
    isEmpty(item?.["状態"]) ||
    isEmpty(item?.["即決"]) ||
    isEmpty(item?.["地域"]) ||
    isEmpty(item?.["送料無料"]) ||
    isEmpty(item?.["贈答品向き"]) ||
    isEmpty(item?.["Tポイント"]) ||
    isEmpty(item?.["値下げ交渉"]) ||
    isEmpty(item?.["NEW"]) ||
    isEmpty(item?.["画像あり"]) ||
    isEmpty(item?.["目立ちアイコン"]) ||
    isEmpty(item?.["チャリティー"])
    // isEmpty(item['除外出品者']) // should always empty
  );
}

// Main logic (where the app runs)
(async () => {
  const isProxyActive = process.env.IS_PROXY_ACTIVE === "true";
  const startTime = performance.now();
  const inputParsedData: CSVInput[] = (await readData(
    inputFilePath
  )) as CSVInput[];
  let outputParsedData: CSVOutput[] = (await readData(
    outputFilePath
  )) as CSVOutput[];
  const proxiesParsedData: ProxyInput[] = await readProxiesJson(
    proxiesFilePath
  ); 

  console.log(`the number of input read data: ${inputParsedData.length}`);
  console.log(`the number of output read data: ${outputParsedData.length}`);
  console.log(`the number of proxies: ${proxiesParsedData.length}`);

  const keepRunning = true;
  while (keepRunning) {
    try {
      const selectedProxyDummy = selectRandomProxy(proxiesParsedData);

      const args = [
        "--disable-blink-features=AutomationControlled",
        "--disable-webgl",
        "--disable-webrtc",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=375,667",
        // "--v=1"
      ];

      if (isProxyActive) {
        args.push("--proxy-server=" + selectedProxyDummy?.proxy_url);
      }

      const browserForDummy = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args,
      });

      // Yahoo auction has a quirk where the first load of a page can show the wrong number of items.
      // To avoid this, we open a dummy page first.
      if (inputParsedData[0]["OYURL"]) {
        const dummyPage = await browserForDummy.newPage();

        if (isProxyActive) {
          // if your proxy requires authentication
          await dummyPage.authenticate({
            username: selectedProxyDummy.username,
            password: selectedProxyDummy.password,
          });
        }

        // const currentIP = await getCurrentIP(dummyPage);
        // console.log(`Current IP: ${currentIP}`);

        // Setup proxy
        // if (isProxyActive) {
        //   await setupProxy(dummyPage, proxiesParsedData)
        // }

        const agent = new UserAgent();
        await dummyPage.setUserAgent(agent.toString());
        // Because Yahoo Auction forces us to use a mobile view, and the large screen and mobile have different class codes, it is better to use the mobile size.
        await dummyPage.emulate(iPhone);

        // Open dummy page
        await dummyPage.goto(inputParsedData[0]["OYURL"], {
          waitUntil: "networkidle2",
          timeout: 500000,
        });

        await dummyPage.close();
      }

      await browserForDummy.close();

      for (let i = 0; i < inputParsedData.length; i++) {
        const item = inputParsedData[i];
        const selectedProxy = selectRandomProxy(proxiesParsedData);

        // Check other fields as well
        if (
          // If Identity is the same and other fields are not empty, skip
          (outputParsedData?.[i]?.["Identity"] ?? "") === item?.["Identity"] &&
          !isOtherFieldsIsEmpty(outputParsedData?.[i] ?? {})
        ) {
          console.log(`Skipping ${item?.["Identity"] ?? ""} (Row ${i + 1})`);

          continue;
        }

        // Ensure we not missed any row so we will try until max retry
        let keepTrying = true;
        // let currentRetry = 0;
        // const maxRetries = 3;

        while (keepTrying) {
          const args = [
            "--disable-blink-features=AutomationControlled",
            "--disable-webgl",
            "--disable-webrtc",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--window-size=375,667",
            // "--v=1"
          ];

          if (isProxyActive) {
            args.push("--proxy-server=" + selectedProxy?.proxy_url);
          }

          const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args,
          });

          try {
            let YWR = 0;
            let YAC = 0;
            let YWC = 0;
            let YSC = 0;

            // Set up urls
            const NYURL = formatOYURLforNYURL(new URL(item["OYURL"]));
            const sp = item["S.P."].replace(/[^\d.-]/g, ""); // Extract only the number part
            const MYURL = formatNYURLforMYURL(new URL(NYURL), sp);

            // Set up page
            const page = await browser.newPage();

            if (isProxyActive) {
              // if your proxy requires authentication
              await page.authenticate({
                username: selectedProxy.username,
                password: selectedProxy.password,
              });
            }

            // const currentIP = await getCurrentIP(page);
            // console.log(`Current IP: ${currentIP}`);

            // if (isProxyActive) {
            //   await setupProxy(page, proxiesParsedData)
            // }

            const agent = new UserAgent();
            await page.setUserAgent(agent.toString());
            // Since Yahoo Auction forces us to use a mobile view, and the large screen and mobile have different class codes, it is better to use the mobile size.
            await page.emulate(iPhone);

            // Open NYURL and get YAC
            await page.goto(NYURL, {
              waitUntil: "networkidle2",
              timeout: 500000,
            }); // 10-second timeout

            // Check if empty
            try {
              await page.waitForSelector("span.ResultCount__num", {
                visible: true,
                timeout: 500000,
              });

              YAC = Number(
                (await page.$eval("span.ResultCount__num", (element) =>
                  element?.textContent?.trim().replace(/[^\d]/g, "")
                )) ?? 0
              );
            } catch (e) {
              console.log("No products found for YAC");
            }

            // Even though we have set n=100, if the products exceed 100, it still shows more than 100 on mobile
            // So we need to handle this
            if (YAC > maximumDataNeedToCheck) {
              YAC = maximumDataNeedToCheck;
            }

            // Open MYURL and get YWC
            await page.goto(MYURL, {
              waitUntil: "networkidle2",
              timeout: 500000,
            }); // 10-second timeout

            // Check if empty
            try {
              await page.waitForSelector("span.ResultCount__num", {
                visible: true,
                timeout: 500000,
              });

              YWC = Number(
                (await page.$eval("span.ResultCount__num", (element) =>
                  element?.textContent?.trim().replace(/[^\d]/g, "")
                )) ?? 0
              );
            } catch (e) {
              console.log("No products found for YWC");
            }

            // Even though we have set n=100, if the products exceed 100, it still shows more than 100 on mobile
            // So we need to handle this
            if (YWC > maximumDataNeedToCheck) {
              YWC = maximumDataNeedToCheck;
            }

            // Since on mobile version Yahoo always cutting the all page to be 60 items
            // So we need to handle click next page if any
            // Do while
            let keepGoing = true;

            // We will stop it if we found all data for maximum data checked
            let totalDataChecked = 0;
            while (keepGoing) {
              let productsTime = [] as string[];

              // Check if empty
              try {
                await page.waitForSelector(
                  "ul.Result__items > li.Item span.Item__time span.Item__text",
                  { visible: true, timeout: 3000 }
                );

                productsTime =
                  (await page.$$eval(
                    "ul.Result__items > li.Item span.Item__time span.Item__text",
                    (elements) =>
                      elements?.map(
                        (element) => element?.textContent?.trim() ?? ""
                      ) ?? []
                  )) ?? [];
              } catch (e) {
                console.log(`${item.Identity} : No products found for YSC`);
              }

              if (productsTime.length > 0) {
                for (const productTime of productsTime) {
                  const now = new Date();
                  const date = new Date(now.getFullYear() + "/" + productTime);
                  const diff = now.getTime() - date.getTime();
                  const diffDays = diff / (1000 * 3600 * 24);
                  if (diffDays < 30) {
                    YSC = (YSC === 0 ? 0 : YSC) + 1;
                  }
                }
              }

              // If we maximumDataChecked reached then stop
              totalDataChecked += productsTime?.length;
              const isMaximumDataCheckedReached =
                totalDataChecked >= maximumDataNeedToCheck;
              if (isMaximumDataCheckedReached) {
                keepGoing = false;
                break;
              }

              // If the maximumDataChecked is not reached, the mobile view still cuts to 60 products per page.
              // Therefore, we need to click on the next page.
              let foundNextButton: HTMLElement | null;
              try {
                foundNextButton = await page.$eval(
                  "li.nex",
                  (element) => element
                );
              } catch (error) {
                foundNextButton = null;
              }

              if (foundNextButton) {
                let nextButtonInactive: HTMLElement | null;
                try {
                  nextButtonInactive = await page.$eval(
                    "li.nex.nex--inactive",
                    (element) => element
                  );
                } catch (error) {
                  nextButtonInactive = null;
                }
                if (!nextButtonInactive) {
                  await Promise.all([
                    page.waitForNavigation(), // Wait for the navigation to complete
                    page.$eval("li.nex > a", (element) => element.click()), // Click the element
                  ]);
                  continue;
                }
              }

              keepGoing = false;
            }

            // Even though we have set n=100, if the products exceed 100, it still shows more than 100 on mobile
            // So we need to handle this
            if (YSC > maximumDataNeedToCheck) {
              YSC = maximumDataNeedToCheck;
            }

            // await delay(randomNumber(100000, 100000)); // wait for 2 to 3 seconds

            // Include All すべてを含む
            const includeAll = getQueryParamAndDecode(MYURL, ["va", "p"]);

            // Exclude 含めない
            let exclude = getQueryParamAndDecode(MYURL, ["p"])
              ?.replace(includeAll + " ", "")
              .replace(includeAll, "");
            // Sometimes the link doesnt contains p so we need to use ve and ensure only get the negative keyword
            if (isEmpty(exclude)) {
              const ve =
                getQueryParamAndDecode(MYURL, ["ve"])?.split(" ") ?? [];
              exclude = ve[ve?.length - 1]
                ?.replace(includeAll + " ", "")
                ?.replace(includeAll, "");
            }

            // Price Min 価格(下限)
            const priceMin = Number(
              getQueryParamAndDecode(MYURL, ["min", "aucminprice"]) ?? 0
            );

            // Price Max 価格(下限)
            const priceMax = Number(
              getQueryParamAndDecode(MYURL, ["max", "aucmaxprice"]) ?? 0
            );

            YWR = Number((YWC / YAC).toFixed(2)) ?? 0;
            if (isNaN(YWR)) {
              YWR = 0;
            }

            // Update data and save it to the array
            const title = `${item.Identity} | ${item.Keyword} | SP:${item["S.P."]} | YWR:${YWR} | YSC:${YSC} | FMP:${item.FMP} | TSC:${item.TSC}`;
            const group = getGroup(YWR);
            const outputData: CSVOutput = {
              ...item,
              NYURL,
              MYURL,
              YWR,
              YAC,
              YWC,
              YSC,
              タイトル: title,
              グループ: group,
              通知: 1,
              取得件数: 100,
              検索タイプ: `検索`,
              出品者ID: undefined,
              出品者キーワード: undefined,
              すべてを含む: includeAll,
              少なくとも1つを含む: undefined,
              含めない: exclude,
              カテゴリID: 0,
              "カテゴリパス(参考)": `すべてのオークション`,
              検索対象: `タイトル`,
              あいまい検索: 0,
              "価格(下限)": priceMin,
              "価格(上限)": priceMax,
              "即決価格(下限)": 0,
              "即決価格(上限)": 0,
              出品者タイプ: `すべて`,
              状態: `中古`,
              即決: `すべて`,
              地域: `すべての地域`,
              送料無料: 0,
              贈答品向き: 0,
              Tポイント: 0,
              値下げ交渉: 0,
              NEW: 0,
              画像あり: 0,
              目立ちアイコン: `指定しない`,
              チャリティー: `指定しない`,
              除外出品者: undefined,
            };

            outputParsedData[i] = outputData;
            saveData(outputFilePath, outputParsedData);

            await page.close();

            keepTrying = false;
            await browser.close();
            break;
          } catch (error) {
            console.log("Error: ", error);
          }

          await browser.close();
        }

        console.log("Row: ", i + 1);
      }

      if (inputParsedData.length === outputParsedData.length) {
        return;
      }
    } catch (error) {
      console.error(`Error: ${error}`);
    } finally {
    }
  }

  console.log(`the number of output data: ${outputParsedData.length}`);
  const endTime = performance.now();
  console.log(
    `This Execution took ${millisToMinutesAndSeconds(endTime - startTime)}`
  );
})();

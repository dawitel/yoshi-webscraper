/**
 * @description validateData takes in an array of a CSVData object and validates it againist the requirements
 * @param data CSVData
 * @returns
 */
// export const validateData = (data: CSVData[]) => {
//   const eBayUrlRegex = /^https:\/\/www\.ebay\.com\/sch\/i\.html/;

//   let invalidUrlCount = 0;
//   let incompleteDataCount = 0;
//   const invalidDataPositions: number[] = [];

//   data.forEach((item, index) => {
//     if (index === 0) return;

//     const { Identity, eBayURL, Currency, Rank } = item;

//     // Check if any of the fields are missing
//     if (!Identity || !eBayURL || !Currency || !Rank) {
//       incompleteDataCount++;
//       invalidDataPositions.push(index);
//     }

//     // Check if the eBay URL does not match the regex
//     if (!eBayUrlRegex.test(eBayURL)) {
//       invalidUrlCount++;
//     }
//   });

//   return {
//     invalidUrlCount,
//     incompleteDataCount,
//     invalidDataPositions,
//   };
// };




/**
 * @description getRandomProxy takes an array of proxy URLs and returns a random proxy url fro ip rotation
 * @param proxyURLs array of proxy urls as array
 * @returns proxyURL string
 */
// export const getRandomProxy = (proxyURLs: string[]): string => {
//   if (proxyURLs.length === 0) {
//     return ""; // Handle case where the array is empty
//   }

//   const randomArray = new Uint32Array(1);
//   crypto.getRandomValues(randomArray);

//   const randomIndex = randomArray[0] % proxyURLs.length;
//   return proxyURLs[randomIndex];
// };

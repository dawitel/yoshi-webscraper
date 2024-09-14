// import { NextResponse } from "next/server";
// import Papa from "papaparse";
// import logger from "@/lib/logger";
// // import { Emailer } from "@/lib/emailer";

// /**
//  * Handles an HTTP POST request to send an email with a CSV attachment.
//  * It processes the request, converts the JSON data into CSV, and sends it as an email attachment.
//  *
//  * @param {Request} req - The incoming request object containing data for the email.
//  * @returns {Promise<NextResponse>} A Promise that resolves to an HTTP response object
//  * indicating the success or failure of the email sending process.
//  */
// export async function POST(req: Request): Promise<NextResponse> {
//   logger.info("Received email send request...");

//   try {
//     // Extract and parse the incoming JSON data from the request body
//     const { finalData } = await req.json();

//     // Parse the finalData string into JSON if necessary
//     const jsonData =
//       typeof finalData === "string" ? JSON.parse(finalData) : finalData;

//     // Validate that the required data is present
//     if (!jsonData) {
//       return NextResponse.json(
//         { message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Convert the JSON data to CSV format using PapaParse
//     const csvData = Papa.unparse(jsonData);
//     console.log("CSV data: ", csvData);

//     logger.info("Sending the email to the user...");

//     // Send the email using the Resend API, with the CSV attached
//     const args = {
//       Data: csvData,
//       ErrorTo: "",
//     };
//     const { data, error } = await Emailer(args);
//     // Check if there was an error during the email sending process
//     if (error) {
//       return NextResponse.json({ error }, { status: 500 });
//     }
//     logger.info("Sent the email to the user.");
//     return NextResponse.json({ data });
//   } catch (error) {
//     // Handle any errors that occur during the process
//     logger.error("Error occurred while trying to send the email...", error);
//     return NextResponse.json({ error }, { status: 500 });
//   }
// }

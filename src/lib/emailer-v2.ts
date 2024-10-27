import nodemailer from "nodemailer";
import { createWriteStream, promises as fsPromises } from "fs";
import { Readable } from "stream";
import Papa from "papaparse";
import { tmpdir } from "os";
import path from "path";
import Logger from "@/lib/logger"; // Assume you're using a logging utility
import {
  emailTemplate,
  errorEmailTemplate,
} from "@/components/email-templates";

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Define custom response interface
interface CustomEmailResponse<T> {
  data: T | null;
  error: {
    message: string;
    name: string;
  } | null;
}

// Define customizable props interface
interface EmailerProps {
  Data?: any[];
  ErrorTo?: string;
  Subject?: string;
  From?: string;
  To?: string;
  FirstName?: string;
  AttachmentsName?: string;
  ErrorSubject?: string;
}

export const EmailerV2 = async <T>({
  Data,
  ErrorTo,
  Subject = "Here is your requested data", // Default subject
  From = process.env.SENDER_EMAIL, // Default sender
  To, // Default recipient
  FirstName = "Yoshi", // Default first name for email template
  AttachmentsName = "final-data.csv", // Default name for attachments
  ErrorSubject = "🔴 Your last scraping request has failed", // Default error subject
}: EmailerProps): Promise<CustomEmailResponse<T>> => {
  let response: CustomEmailResponse<T> = {
    data: null,
    error: null,
  };

  try {
    if (!Data && !ErrorTo) {
      throw new Error("No data or error recipient provided");
    }

    if (Data) {
      Logger.info("Preparing CSV from the provided data...");

      const csv = Papa.unparse(Data);

      const stream = new Readable(); // establishing a connection to the memory
      stream.push(csv); // reading the csv data
      stream.push(null); // signaling that we have no more data to send the specific memory location

      const filePath = path.join(tmpdir(), `data-${Date.now()}.csv`);
      const fileStream = createWriteStream(filePath); // temporarlly writing the data

      stream.pipe(fileStream); //disconnecting the stream

      // Await the stream's completion before proceeding
      await new Promise<void>((resolve, reject) => {
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
      });

      Logger.info(`CSV file written to ${filePath}`);

      // Ensure the EmailTemplate function returns a string
      const emailHtml = emailTemplate(FirstName);
      if (typeof emailHtml !== "string") {
        throw new Error("Email template did not return a string");
      }

      await transporter.sendMail({
        from: From,
        to: To,
        subject: Subject,
        html: emailHtml, // This must be a valid string
        attachments: [
          {
            filename: AttachmentsName,
            path: filePath,
            contentType: "text/csv",
          },
        ],
      });

      Logger.info("Email with CSV sent successfully");

      // Delete the temporary file after sending the email
      await fsPromises.unlink(filePath); // deleting the csv file that we temporary stored in the memory by stream
      Logger.info(`Temporary CSV file ${filePath} deleted`);

      response = {
        data: "Email sent successfully" as unknown as T,
        error: null,
      };
    }

    if (ErrorTo) {
      Logger.info(`Sending error email to ${ErrorTo}`);

      const errorEmailHtml = errorEmailTemplate(FirstName);
      if (typeof errorEmailHtml !== "string") {
        throw new Error("Error email template did not return a string");
      }

      await transporter.sendMail({
        from: From,
        to: ErrorTo,
        subject: ErrorSubject,
        html: errorEmailHtml,
      });

      Logger.info("Error email sent successfully");

      response = {
        data: "Error email sent successfully" as unknown as T,
        error: null,
      };
    }

    return response;
  } catch (error: any) {
    Logger.error("Error occurred while sending the email", error);

    return {
      data: null,
      error: {
        message: error.message || "An unknown error occurred",
        name: error.name || "EmailerError",
      },
    };
  }
};

"use client";

import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileData } from "@/types/interface";

interface ScrapingHistoryViewerProps {
  scrapedData: FileData[];
}

const ScrapingHistoryViewer: React.FC<ScrapingHistoryViewerProps> = ({
  scrapedData,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDownload = async (downloadUrl: string, fileName: string) => {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); 
    } catch (error) {
      console.error("Failed to download the file:", error);
    }
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetTrigger asChild>
        <Button
          className="bg-blue-500 dark:bg-blue-800 hover:bg-blue-600 w-full text-white px-4 py-2 rounded"
          onClick={() => setIsDrawerOpen(true)}
        >
          View Scraping History
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-4 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Recent Scraping History</h2>
        <ul className="grid gap-4">
          {scrapedData.length ? (
            scrapedData.map((data, index) => (
              <li
                key={index}
                className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 shadow-md flex flex-col items-center"
              >
                <p className="font-semibold">{data.fileName.split(".")[0]}</p>
                <Button
                  className="bg-blue-500 dark:bg-blue-700 hover:bg-blue-600 w-full dark:hover:bg-blue-800 text-white px-4 py-2 mt-6 rounded"
                  onClick={() =>
                    handleDownload(data.downloadUrl, data.fileName)
                  }
                >
                  Download
                </Button>
              </li>
            ))
          ) : (
            <p>No recent data available</p>
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
};

export default ScrapingHistoryViewer;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CsvUpload from "@/components/fileupload";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ModeToggle } from "@/components/theme-toggle";
import { UserButton } from "@/components/user-button";
import ScrapingHistoryViewer from "@/components/history";
import { FileData } from "@/types/interface";

export default function Dashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<FileData[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/v1/auth/check", {
        method: "GET",
        credentials: "include",
      });

      if (res.status !== 200) {
        router.push("/"); // Redirect if not logged in
      }
    };

    checkAuth();

    // Fetch the 10 most recent scraped data files
    const fetchScrapedData = async () => {
      try {
        const res = await fetch("/api/v1/history", {
          method: "GET",
        });
        const data: FileData[] = await res.json();
        setScrapedData(data);
      } catch (error) {
        console.error("Failed to fetch scraped data:", error);
      }
    };

    fetchScrapedData();
  }, [router]);

  const handleFileUpload = async (
    file: File,
    email: string,
    storeName: string,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    formData.append("storeName", storeName);

    try {
      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          variant: "success",
          title: "CSV File uploaded successfully",
          description: "Wait for the processed CSV file in your inbox!",
          action: <ToastAction altText="success button">cancel</ToastAction>,
        });
        router.refresh();
      } else if (response.status === 429) {
        toast({
          variant: "destructive",
          title: "Upload in progress",
          description:
            "Another upload is currently being processed. Please wait.",
          action: <ToastAction altText="try again">Try again</ToastAction>,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Your CSV file contains invalid fields",
          description: "Please try uploading a valid file",
          action: <ToastAction altText="try again">Try again</ToastAction>,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sorry, Failed to upload your file",
        description: "Please try uploading the file again",
        action: <ToastAction altText="try again">Try again</ToastAction>,
      });
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);

      // Reset file input to enable re-uploading the same file
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <div className="absolute top-0 gap-x-5 flex right-0 p-10">
          {" "}
          <ScrapingHistoryViewer scrapedData={scrapedData} />
          <ModeToggle />
          <UserButton />
        </div>
        <h1 className="font-sans text-balance dark:bg-gray-900 rounded-xl shadow-2xl px-4 dark:hover:shadow-2xl py-5 font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          Upload Your CSV file{" "}
          <span className="cursor-pointer hover:translate-y-3 rounded-md hover:shadow-2xl">
            📁
          </span>
        </h1>
        <p className="max-w-[42rem] mt-5 leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Drop your CSV file, name of the store you are looking for, and email
          here and wait for the result to be dropped in your inbox.
        </p>
        <p className="rounded-2xl dark:bg-gray-800 bg-gray-100 font-light transition px-4 py-1.5 text-sm mb-3">
          Avg. waiting time is{" "}
          <span className="font-extrabold text-lg">~ 10 minutes</span>
        </p>

        <CsvUpload
          onFileUpload={handleFileUpload}
          btnText={isLoading ? "Uploading..." : "Upload CSV File"}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}

"use client";

import { ChooseDataFormat } from "@/components/dropdown";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { heroHeader } from "@/config/content";
import { cn, convertJsonToCsv, downloadCsv } from "@/lib/utils";
import { Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HeroHeader() {
  const [url, setUrl] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const jsonData = [
    { name: "John Doe", age: 30, email: "john@example.com" },
    { name: "Jane Smith", age: 25, email: "jane@example.com" },
  ];
  const handleDownload = () => {
    const csvData = convertJsonToCsv(jsonData);
    if (csvData) {
      downloadCsv(csvData, "data.csv");
    }
  };
  return (
    <section className="container flex flex-col gap-4 pb-12 pt-4 text-center lg:items-center lg:gap-8 lg:py-20">
      <div className="flex flex-1 flex-col items-center gap-4 text-center lg:gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold lg:text-6xl">
            {heroHeader.header}
          </h1>
          <h1 className="text-2xl font-semibold lg:text-4xl">
            {heroHeader.subheader}
          </h1>
          <h2 className="text-xs font-light text-muted-foreground lg:text-3xl">
            {heroHeader.subheader1}
          </h2>
        </div>
        <div className="flex gap-2 items-center justify-center">
          <form onSubmit={handleSubmit}>
            <Input
              value={url}
              onChange={handleInputChange}
              className="border-2 border-solid border-black"
              placeholder="Enter a url..."
            />
            <ChooseDataFormat />
            <Button
              type="submit"
              className={`w-[10rem] ${cn(buttonVariants({ size: "lg" }))}`}
            >
              Scrape 🔥
            </Button>
          </form>
        </div>
        <Button
          onClick={handleDownload}
          className={`text-white gap-2 flex ${cn(
            buttonVariants({ size: "lg", variant: "primary" })
          )}`}
        >
          <Download />
          <p>Download your data</p>
        </Button>
      </div>
    </section>
  );
}

"use client";

import { ChooseDataFormat } from "@/components/dropdown";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { heroHeader } from "@/config/content";
import { cn, convertJsonToCsv, downloadCsv } from "@/lib/utils";
import { Download } from "lucide-react";
import Link from "next/link";

export default function HeroHeader() {
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
            {heroHeader.subheader1}
          </h1>
          <h2 className="text-lg font-light text-muted-foreground lg:text-3xl">
            {heroHeader.subheader}
          </h2>
        </div>
        <div className="flex gap-2 items-center justify-center">
          <Input className="border-solid" placeholder="Enter a url..." />
          <ChooseDataFormat />
          <Link
            href=""
            target="_blank"
            className={`w-[10rem] ${cn(buttonVariants({ size: "lg" }))}`}
          >
            Scrape 🔥
          </Link>
        </div>
        <Button
          onClick={handleDownload}
          className={`w-[10rem] gap-2 flex items-center justify-center bg-blue-700 ${cn(
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

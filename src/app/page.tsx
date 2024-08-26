"use client";

import { ChooseDataFormat } from "@/components/dropdown";
import { Input } from "@/components/ui/input";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

export default function Home() {
  const [result, setResults] = useState<object>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleOnClick() {
    const results = await fetch("/api/scraper", {
      method: "POST",
      body: JSON.stringify({
        siteUrl: "https://spacejelly.dev",
      }),
    }).then((r) => r.json());
    setResults(results);
  }

  return (
    <main className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold mb-8">Hi Yoshi✋!</h1>
          <h1 className="text-5xl font-bold mb-8">
            Let&apos;s scrape some data!
          </h1>
          <p className="mb-2">
            Enter the url, choose data format and click scrape.
          </p>
          <div className="flex gap-3">
            <p className="mb-6">
              <Input placeholder="enter a url to scrape..." />
              <ChooseDataFormat />
              <button
                disabled={isLoading}
                className="btn btn-primary"
                onClick={handleOnClick}
              >
                {isLoading ? "scraping..." : "Scrape 🔥"}
              </button>
            </p>
          </div>
          {result && (
            <div className="grid">
              <pre className="bg-zinc-200 text-left py-4 px-5 rounded overflow-x-scroll">
                <code>{JSON.stringify(result, undefined, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

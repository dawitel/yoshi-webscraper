"use client";

import InputForm from "@/components/form";
import { useState } from "react";

export default function Home() {
  const [result, setResults] = useState<object>();

  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-sans text-balance font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Hi Yoshi ✋!
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Let&apos;s scrape some data!
          </p>
          <p className="mb-2 text-white font-bold items-center justify-center">
            Enter the url, choose data format and click scrape.
          </p>
          <InputForm />
        </div>
        {/* {result && (
          <div className="grid">
            <pre className="bg-zinc-200 text-left py-4 px-5 rounded overflow-x-scroll">
              <code>{JSON.stringify(result, undefined, 2)}</code>
            </pre>
          </div>
        )} */}
      </section>
    </>
  );
}

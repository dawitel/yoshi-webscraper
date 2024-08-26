"use client";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { heroHeader } from "@/config/content";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HeroHeader() {
  return (
    <section className="container flex flex-col gap-4 pb-12 pt-4 text-center lg:items-center lg:gap-8 lg:py-20">
      <div className="flex flex-1 flex-col items-center gap-4 text-center lg:gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold lg:text-6xl">
            {heroHeader.header}
          </h1>
          <h2 className="text-lg font-light text-muted-foreground lg:text-3xl">
            {heroHeader.subheader}
          </h2>
        </div>
        <div className="flex gap-2 items-center justify-center">
          <Input placeholder="Enter a url..."/>
          <Link
            href=""
            target="_blank"
            className={`w-[10rem] ${cn(buttonVariants({ size: "lg" }))}`}
          >
            Scrape 🔥
          </Link>
        </div>
      </div>
    </section>
  );
}

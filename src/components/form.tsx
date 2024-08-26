import React, { useState } from "react";
import { Input } from "./ui/input";
import { ChooseDataFormat } from "./dropdown";

const InputForm: React.FC = () => {
  const [url, setUrl] = useState<string>("");

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-x-4">
        <Input
          type="text"
          value={url}
          onChange={handleInputChange}
          placeholder="enter a url to scrape..."
        />
        <ChooseDataFormat />
        <button
          className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md"
          type="submit"
        >
          Scrape 🔥
        </button>
      </div>
    </form>
  );
};

export default InputForm;

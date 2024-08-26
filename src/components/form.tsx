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
          type="submit"
        >
          Scrape 🔥
        </button>
      </div>
    </form>
  );
};

export default InputForm;

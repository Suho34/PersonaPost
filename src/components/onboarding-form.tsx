"use client";

import { useState, useEffect } from "react";

export default function OnboardingForm() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  // Fetch existing URL on load
  useEffect(() => {
    fetch("/api/brand")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile?.websiteUrl) {
          setUrl(data.profile.websiteUrl);
          setStatus("saved");
        }
      });
  }, []);

  // Add this function inside your component, or update handleSubmit

  const triggerScrape = async () => {
    setStatus("saved"); // Add "scraping" to your status state type!
    try {
      const res = await fetch("/api/brand/scrape", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert(`Success! We extracted ${data.chunkCount} text chunks.`);
        setStatus("saved");
      } else {
        alert("Scrape failed: " + data.error);
        setStatus("idle");
      }
    } catch (e) {
      setStatus("idle");
    }
  };

  // Update your handleSubmit to call this AFTER saving
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Save URL
      const saveRes = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (saveRes.ok) {
        // 2. Trigger Scrape immediately
        await triggerScrape();
      } else {
        alert("Failed to save URL.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Setup Your Brand Voice</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Enter your website URL. We will analyze it to learn your style.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <input
            type="url"
            placeholder="https://mywebsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading
            ? "Saving..."
            : status === "saved"
            ? "Update URL"
            : "Save Website"}
        </button>
      </form>
    </div>
  );
}

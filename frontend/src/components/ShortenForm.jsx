import React, { useState } from "react";

export default function ShortenForm() {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3005/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl, customAlias, expiresIn }),
    });
    const data = await res.json();
    setResult(data.shortUrl || data.error);
  };

  return (
    <div className="card">
      <h2>Shorten a URL</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter long URL"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Custom alias (optional)"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
        />
        <input
          type="text"
          placeholder="Expiry (e.g., 60s, 10m)"
          value={expiresIn}
          onChange={(e) => setExpiresIn(e.target.value)}
        />
        <button type="submit">Shorten</button>
      </form>
      {result && (
        <p className="result">
          Short URL: <a href={result}>{result}</a>
        </p>
      )}
    </div>
  );
}

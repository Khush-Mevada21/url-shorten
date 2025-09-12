import React, { useState } from "react";

export default function StatsViewer() {
  const [shortId, setShortId] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const handleFetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:3005/stats/${shortId}`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        setError("");
      } else {
        setError(data.error || "Something went wrong");
        setStats(null);
      }
    } catch (err) {
      setError("Backend not reachable");
      setStats(null);
    }
  };

  return (
    <div className="card">
      <h2>View URL Stats</h2>
      <input
        type="text"
        placeholder="Enter short ID"
        value={shortId}
        onChange={(e) => setShortId(e.target.value)}
      />
      <button onClick={handleFetchStats}>Fetch Stats</button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {stats && (
        <div className="stats">
          <p>
            <strong>Short ID:</strong> {stats.shortId}
          </p>
          <p>
            <strong>Long URL:</strong>{" "}
            <a href={stats.longUrl} target="_blank" rel="noopener noreferrer">
              {stats.longUrl}
            </a>
          </p>
          <p>
            <strong>Clicks:</strong> {stats.clicks}
          </p>
          <p>
            <strong>Created At:</strong> {stats.createdAt}
          </p>
          <p>
            <strong>Last Accessed:</strong> {stats.lastAccessed}
          </p>
        </div>
      )}
    </div>
  );
}

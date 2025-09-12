import React, { useState } from "react";

export default function LogsViewer() {
  const [shortId, setShortId] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const handleFetchLogs = async () => {
    try {
      const res = await fetch(`http://localhost:3005/logs/${shortId}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setError("");
      } else {
        setError(data.error || "Something went wrong");
        setLogs([]);
      }
    } catch (err) {
      setError("Backend not reachable");
      setLogs([]);
    }
  };

  return (
    <div className="card logs-card">
      <h2>View URL Logs</h2>
      <div className="logs-input">
        <input
          type="text"
          placeholder="Enter short ID"
          value={shortId}
          onChange={(e) => setShortId(e.target.value)}
        />
        <button onClick={handleFetchLogs}>Fetch Logs</button>
      </div>

      {error && <p className="error">{error}</p>}

      {logs.length > 0 && (
        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>IP</th>
                <th>User Agent</th>
                <th>Referrer</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{log.ip}</td>
                  <td title={log.userAgent}>{log.userAgent}</td>
                  <td>{log.referrer}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

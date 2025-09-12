import "./App.css";
import ShortenForm from "./components/ShortenForm";
import StatsViewer from "./components/StatsViewer";
import LogsViewer from "./components/LogsViewer";

function App() {
  return (
    <div className="App">
      <h1>URL Shortener</h1>

      <ShortenForm />
      <StatsViewer />
      <LogsViewer />
    </div>
  );
}

export default App;

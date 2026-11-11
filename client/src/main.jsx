import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import DataVersionProvider from "./context/DataVersionProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <DataVersionProvider>
        <App />
      </DataVersionProvider>
    </BrowserRouter>
  </StrictMode>,
);

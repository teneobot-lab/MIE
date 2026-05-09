import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

import { setAuthTokenGetter } from "@workspace/api-client-react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

setAuthTokenGetter(() => localStorage.getItem("mab_admin_token"));

createRoot(document.getElementById("root")!).render(<App />);

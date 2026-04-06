import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";
import { initMetaPixel } from "./lib/metaPixel";
import { persistUtmParams } from "./lib/utm";

persistUtmParams();

const scheduleNonCriticalInit = () => {
  initMetaPixel();
};

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(scheduleNonCriticalInit, { timeout: 2000 });
} else {
  window.setTimeout(scheduleNonCriticalInit, 800);
}

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
  </>,
);

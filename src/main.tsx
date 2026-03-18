import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMetaPixel } from "./lib/metaPixel";
import { persistUtmParams } from "./lib/utm";

persistUtmParams();
initMetaPixel();

createRoot(document.getElementById("root")!).render(<App />);

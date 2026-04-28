import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const GUIA_SRC = path.join(ROOT, "scripts", "guia-residentes.html");
const GUIA_DST = path.join(DIST_DIR, "guia-residentes", "index.html");

try {
  await fs.mkdir(path.join(DIST_DIR, "guia-residentes"), { recursive: true });
  await fs.copyFile(GUIA_SRC, GUIA_DST);
  console.log("✓ guia-residentes/index.html written");
} catch (e) {
  console.warn("copy-guia warning:", e.message);
}

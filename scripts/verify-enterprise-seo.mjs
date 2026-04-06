import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const MANIFEST_PATH = path.join(DIST_DIR, "prerender-manifest.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const manifestRaw = await fs.readFile(MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(manifestRaw);

  let checked = 0;

  for (const entry of manifest) {
    const filePath = path.join(DIST_DIR, entry.output);
    const html = await fs.readFile(filePath, "utf8");

    assert(html.includes("<title>"), `${entry.path}: missing <title>`);
    assert(html.includes('name="description"'), `${entry.path}: missing description meta`);
    assert(html.includes('rel="canonical"'), `${entry.path}: missing canonical`);
    assert(html.includes('property="og:title"'), `${entry.path}: missing og:title`);
    assert(html.includes('name="twitter:title"'), `${entry.path}: missing twitter:title`);
    assert(html.includes('application/ld+json'), `${entry.path}: missing JSON-LD`);
    assert(html.includes("<noscript>"), `${entry.path}: missing noscript fallback`);
    checked += 1;
  }

  const headersPath = path.join(ROOT, "public", "_headers");
  const redirectsPath = path.join(ROOT, "public", "_redirects");
  const [headers, redirects] = await Promise.all([
    fs.readFile(headersPath, "utf8"),
    fs.readFile(redirectsPath, "utf8"),
  ]);

  assert(headers.includes("/admin"), "Missing admin header directives");
  assert(headers.includes("X-Robots-Tag: noindex, nofollow"), "Missing noindex header policy");
  assert(redirects.includes("/*"), "Missing SPA fallback in _redirects");

  console.log(`Enterprise SEO verification passed for ${checked} prerendered routes.`);
}

main().catch((error) => {
  console.error("Enterprise SEO verification failed.");
  console.error(error.message || error);
  process.exit(1);
});

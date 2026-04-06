import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SCORECARD_PATH = path.join(ROOT, "dist", "seo", "scorecard.json");

async function main() {
  const raw = await fs.readFile(SCORECARD_PATH, "utf8");
  const routes = JSON.parse(raw);

  const moneyPages = routes.filter((route) => route.priority >= 0.9);
  const failingMoneyPages = moneyPages.filter((route) => route.score < 90);
  const weakCorePages = routes.filter((route) => route.priority >= 0.75 && route.score < 80);

  const summaryLines = [
    "# SEO Threshold Report",
    "",
    `Money pages checked: ${moneyPages.length}`,
    `Money pages below 90: ${failingMoneyPages.length}`,
    `Core pages below 80: ${weakCorePages.length}`,
    "",
  ];

  if (failingMoneyPages.length > 0) {
    summaryLines.push("## Money pages below 90", "");
    for (const route of failingMoneyPages) {
      summaryLines.push(`- ${route.path} -> ${route.score}`);
    }
    summaryLines.push("");
  }

  if (weakCorePages.length > 0) {
    summaryLines.push("## Core pages below 80", "");
    for (const route of weakCorePages) {
      summaryLines.push(`- ${route.path} -> ${route.score}`);
    }
    summaryLines.push("");
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${summaryLines.join("\n")}\n`);
  } else {
    console.log(summaryLines.join("\n"));
  }

  if (failingMoneyPages.length > 0) {
    console.error("SEO threshold failed: one or more money pages are below 90.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("SEO threshold check failed.");
  console.error(error);
  process.exit(1);
});

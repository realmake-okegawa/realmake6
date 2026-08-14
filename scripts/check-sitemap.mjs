import fs from "node:fs";

const sitemap = fs.readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const results = await Promise.all(urls.map(async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { url, status: response.status };
  } catch (error) {
    return { url, status: 0, error: error.message };
  }
}));
const failed = results.filter((result) => result.status !== 200);
console.log(`sitemap URLs: ${results.length}; HTTP 200: ${results.length - failed.length}`);
if (failed.length) {
  for (const result of failed) console.error(`${result.status}\t${result.url}${result.error ? `\t${result.error}` : ""}`);
  process.exitCode = 1;
}

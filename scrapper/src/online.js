const fs = require("node:fs/promises");
const path = require("node:path");
const { extractArticlesFromHtml } = require("./ExtractArticle");

const logDirectory = path.join(__dirname, "..", "logs");
const logFilePath = path.join(logDirectory, "scrapper.json");
const backendApiUrl = process.env.BACKEND_API_URL ?? "http://backend:3000/api";
const scrapperId = Number(process.env.SCRAPPER_ID);

async function writeLog(payload) {
  await fs.mkdir(logDirectory, { recursive: true });
  await fs.writeFile(logFilePath, JSON.stringify(payload, null, 2), "utf8");
}

async function fetchCurrentScrapper() {
  if (!Number.isInteger(scrapperId)) {
    throw new Error("SCRAPPER_ID must be a valid integer");
  }

  const response = await fetch(`${backendApiUrl}/scrappers`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GET /scrappers failed: ${response.status} ${body}`);
  }

  const scrappers = await response.json();
  return scrappers.find((item) => item.scrapperId === scrapperId) ?? null;
}

async function assertScrapperRunnable() {
  const scrapper = await fetchCurrentScrapper();

  if (!scrapper) {
    throw new Error(`Scrapper ${scrapperId} not found`);
  }

  if (scrapper.state === "pause") {
    console.log("Scrapper Pause");
    process.exit(0);
  }

  if (scrapper.state === "error") {
    console.log("Scrapper Error");
    process.exit(1);
  }

  return scrapper;
}

function buildArticlePayload(article, baseUrl) {
  const url = new URL(article.href, baseUrl).toString();
  const publicationTimestamp =
    article.metadata?.firstUpdated ?? article.metadata?.lastUpdated ?? null;
  const publicationDate =
    typeof publicationTimestamp === "number"
      ? new Date(publicationTimestamp).toISOString()
      : undefined;
  const source = new URL(baseUrl).hostname.replace(/^www\./, "");

  return {
    title: article.title,
    url,
    ...(publicationDate ? { publicationDate } : {}),
    source,
  };
}

async function articleExists(payload) {
  const response = await fetch(`${backendApiUrl}/articles/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`POST /articles/check failed: ${response.status} ${body}`);
  }

  return response.json();
}

async function createArticle(article, baseUrl) {
  const payload = buildArticlePayload(article, baseUrl);
  const checkResult = await articleExists(payload);

  if (checkResult.exists) {
    return null;
  }

  const response = await fetch(`${backendApiUrl}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`POST /articles failed: ${response.status} ${body}`);
  }

  return response.json();
}

async function ScrapperSniffer() {
  const uriToScrap = process.env.URI_TO_SCRAP;

  if (!uriToScrap) {
    throw new Error("URI_TO_SCRAP is required");
  }

  console.log(`URI_TO_SCRAP: ${uriToScrap}`);

  const response = await fetch(uriToScrap);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Fetch failed: ${response.status} ${body}`);
  }

  const html = await response.text();
  const { title, articles } = extractArticlesFromHtml(html);

  for (const article of articles) {
    await assertScrapperRunnable();
    await createArticle(article, uriToScrap);
  }

  const logPayload = {
    timestamp: new Date().toISOString(),
    url: uriToScrap,
    title: title ?? null,
    articlesCount: articles.length,
    articles,
  };

  await writeLog(logPayload);
  console.log(`Scrapper log written to ${logFilePath}`);
}

module.exports = {
  ScrapperSniffer,
};

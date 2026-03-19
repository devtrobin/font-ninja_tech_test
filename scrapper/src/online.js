const fs = require("node:fs/promises");
const path = require("node:path");

const logDirectory = path.join(__dirname, "..", "logs");
const backendApiUrl = process.env.BACKEND_API_URL ?? "http://backend:3000/api";
const scrapperId = Number(process.env.SCRAPPER_ID);
const extractorFile = process.env.EXTRACTOR_FILE;

function getLogFilePath() {
  if (!extractorFile) {
    throw new Error("EXTRACTOR_FILE is required");
  }

  const logFileName = extractorFile.replace(/\.js$/i, ".json");
  return path.join(logDirectory, logFileName);
}

function loadExtractor() {
  if (!extractorFile) {
    throw new Error("EXTRACTOR_FILE is required");
  }

  console.log(`[scrapper] Loading extractor for file: ${extractorFile}`);

  const extractorCandidates = [
    path.join("/extractors", extractorFile),
    path.join(__dirname, extractorFile),
  ];

  for (const extractorPath of extractorCandidates) {
    try {
      console.log(`[scrapper] Trying extractor path: ${extractorPath}`);
      return require(extractorPath);
    } catch (error) {
      if (error?.code !== "MODULE_NOT_FOUND") {
        throw error;
      }

      console.log(`[scrapper] Extractor not found at: ${extractorPath}`);
    }
  }

  throw new Error(`Unable to load extractor file: ${extractorFile}`);
}

async function writeLog(payload) {
  const logFilePath = getLogFilePath();
  await fs.mkdir(logDirectory, { recursive: true });
  await fs.writeFile(logFilePath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`[scrapper] JSON log written on disk: ${logFilePath}`);
  return logFilePath;
}

async function fetchCurrentScrapper() {
  if (!Number.isInteger(scrapperId)) {
    throw new Error("SCRAPPER_ID must be a valid integer");
  }

  console.log(`[scrapper] Fetching scrapper status for scrapperId=${scrapperId}`);
  const response = await fetch(`${backendApiUrl}/scrappers`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GET /scrappers failed: ${response.status} ${body}`);
  }

  const scrappers = await response.json();
  const scrapper = scrappers.find((item) => item.scrapperId === scrapperId) ?? null;
  console.log(
    `[scrapper] Scrapper lookup result for scrapperId=${scrapperId}: ${scrapper ? scrapper.state : "not-found"}`,
  );
  return scrapper;
}

async function assertScrapperRunnable() {
  console.log("[scrapper] Checking scrapper state before continuing");
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

  console.log(`[scrapper] Scrapper is runnable with state=${scrapper.state}`);
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
  console.log(`[scrapper] Checking article existence for url=${payload.url}`);
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

  const result = await response.json();
  console.log(
    `[scrapper] Article existence result for url=${payload.url}: exists=${result.exists} articleId=${result.articleId}`,
  );
  return result;
}

async function createArticle(article, baseUrl) {
  const payload = buildArticlePayload(article, baseUrl);
  console.log(
    `[scrapper] Preparing article for API: id=${article.id} title="${article.title}" url=${payload.url}`,
  );
  const checkResult = await articleExists(payload);

  if (checkResult.exists) {
    console.log(
      `[scrapper] Article already exists, skipping creation: url=${payload.url} existingArticleId=${checkResult.articleId}`,
    );
    return null;
  }

  console.log(`[scrapper] Creating article through API: url=${payload.url}`);
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

  const createdArticle = await response.json();
  console.log(
    `[scrapper] Article created successfully: createdArticleId=${createdArticle.id} url=${createdArticle.url}`,
  );
  return createdArticle;
}

async function ScrapperSniffer() {
  const uriToScrap = process.env.URI_TO_SCRAP;
  const { extractArticlesFromHtml } = loadExtractor();

  if (!uriToScrap) {
    throw new Error("URI_TO_SCRAP is required");
  }

  console.log(`URI_TO_SCRAP: ${uriToScrap}`);

  console.log(`[scrapper] Fetching source page: ${uriToScrap}`);
  const response = await fetch(uriToScrap);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Fetch failed: ${response.status} ${body}`);
  }

  const html = await response.text();
  console.log(`[scrapper] Source page fetched successfully: ${uriToScrap}`);
  const { title, articles } = extractArticlesFromHtml(html);
  console.log(
    `[scrapper] Extraction completed for source="${title ?? "N/A"}" with articlesCount=${articles.length}`,
  );

  for (const article of articles) {
    console.log(
      `[scrapper] Processing extracted article: id=${article.id} title="${article.title}"`,
    );
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

  const logFilePath = await writeLog(logPayload);
  console.log(`Scrapper log written to ${logFilePath}`);
}

module.exports = {
  ScrapperSniffer,
};

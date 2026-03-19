const fs = require("node:fs/promises");
const path = require("node:path");

const logDirectory = path.join(__dirname, "..", "logs");
const logFilePath = path.join(logDirectory, "scrapper.json");

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

async function writeLog(payload) {
  await fs.mkdir(logDirectory, { recursive: true });
  await fs.writeFile(logFilePath, JSON.stringify(payload, null, 2), "utf8");
}

function findBalancedJsonObject(text, startIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function extractJsonObjects(text) {
  const jsonObjects = [];
  const seen = new Set();

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "{") {
      continue;
    }

    const candidate = findBalancedJsonObject(text, index);

    if (!candidate || seen.has(candidate)) {
      continue;
    }

    try {
      const parsed = JSON.parse(candidate);
      jsonObjects.push(parsed);
      seen.add(candidate);
      index += candidate.length - 1;
    } catch {
      continue;
    }
  }

  return jsonObjects;
}

function isNonEmptyValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function isArticleCandidate(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(item, "href") &&
    Object.prototype.hasOwnProperty.call(item, "title") &&
    Object.prototype.hasOwnProperty.call(item, "id") &&
    Object.prototype.hasOwnProperty.call(item, "description") &&
    Object.prototype.hasOwnProperty.call(item, "metadata") &&
    isNonEmptyValue(item.href) &&
    isNonEmptyValue(item.title) &&
    isNonEmptyValue(item.id) &&
    isNonEmptyValue(item.description) &&
    isNonEmptyValue(item.metadata) &&
    isNonEmptyValue(item.metadata.contentType) &&
    item.metadata?.contentType === "article"
  );
}

function extractArticles(input, articles = [], seen = new Set()) {
  if (!input || typeof input !== "object") {
    return articles;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      extractArticles(item, articles, seen);
    }
    return articles;
  }

  if (isArticleCandidate(input)) {
    const key = input.id;

    if (!seen.has(key)) {
      seen.add(key);
      articles.push(input);
    }
  }

  for (const value of Object.values(input)) {
    if (value && typeof value === "object") {
      extractArticles(value, articles, seen);
    }
  }

  return articles;
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
  const title = extractTitle(html);
  const jsonObjects = extractJsonObjects(html);
  const articles = extractArticles(jsonObjects);

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

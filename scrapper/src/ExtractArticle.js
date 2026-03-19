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

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractArticlesFromHtml(html) {
  const title = extractTitle(html);
  const jsonObjects = extractJsonObjects(html);
  const articles = extractArticles(jsonObjects);

  return {
    title,
    articles,
  };
}

module.exports = {
  extractArticlesFromHtml,
};

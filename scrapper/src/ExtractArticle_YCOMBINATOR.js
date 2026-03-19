function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, "").trim();
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].trim()) : null;
}

function toPublicationDate(age) {
  if (!age) {
    return null;
  }

  const match = age.match(/(\d+)\s+(minute|minutes|hour|hours|day|days|month|months|year|years)\s+ago/i);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const publicationDate = new Date();

  if (unit.startsWith("minute")) {
    publicationDate.setMinutes(publicationDate.getMinutes() - value);
  } else if (unit.startsWith("hour")) {
    publicationDate.setHours(publicationDate.getHours() - value);
  } else if (unit.startsWith("day")) {
    publicationDate.setDate(publicationDate.getDate() - value);
  } else if (unit.startsWith("month")) {
    publicationDate.setMonth(publicationDate.getMonth() - value);
  } else if (unit.startsWith("year")) {
    publicationDate.setFullYear(publicationDate.getFullYear() - value);
  }

  return publicationDate.toISOString();
}

function extractArticlesFromHtml(html) {
  const title = extractTitle(html);
  const articles = [];

  const rowPattern =
    /<tr[^>]*class=['"][^'"]*\bathing\b[^'"]*['"][^>]*id=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/tr>\s*<tr[^>]*>([\s\S]*?)<\/tr>/gi;

  for (const match of html.matchAll(rowPattern)) {
    const [, id, articleRowHtml, metaRowHtml] = match;

    const linkMatch = articleRowHtml.match(
      /<span[^>]*class=['"][^'"]*\btitleline\b[^'"]*['"][^>]*>[\s\S]*?<a[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/i,
    );

    if (!linkMatch) {
      continue;
    }

    const [, href, rawTitle] = linkMatch;
    const scoreMatch = metaRowHtml.match(
      /<span[^>]*class=['"]score['"][^>]*>([^<]+)<\/span>/i,
    );
    const authorMatch = metaRowHtml.match(
      /<a[^>]*class=['"]hnuser['"][^>]*>([^<]+)<\/a>/i,
    );
    const ageMatch = metaRowHtml.match(
      /<span[^>]*class=['"]age['"][^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i,
    );
    const commentsMatch = metaRowHtml.match(
      /<a[^>]*href=['"]item\?id=\d+['"][^>]*>([^<]*comments?[^<]*)<\/a>/i,
    );

    const articleTitle = decodeHtml(stripTags(rawTitle));
    const age = ageMatch?.[1]?.trim() ?? null;
    const descriptionParts = [
      scoreMatch?.[1]?.trim(),
      authorMatch?.[1]?.trim() ? `by ${authorMatch[1].trim()}` : null,
      age,
      commentsMatch?.[1]?.trim(),
    ].filter(Boolean);

    articles.push({
      id,
      title: articleTitle,
      href: decodeHtml(href),
      description: descriptionParts.join(" | ") || "Hacker News article",
      metadata: {
        contentType: "article",
        source: "ycombinator",
      },
      score: scoreMatch?.[1]?.trim() ?? null,
      author: authorMatch?.[1]?.trim() ?? null,
      age,
      publicationDate: toPublicationDate(age),
      comments: commentsMatch?.[1]?.trim() ?? null,
    });
  }

  return {
    title,
    articles,
  };
}

module.exports = {
  extractArticlesFromHtml,
};

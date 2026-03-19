const backendApiUrl = process.env.BACKEND_API_URL ?? "http://backend:3000/api";
const scrapperId = Number(process.env.SCRAPPER_ID);

async function fetchScrappers() {
  const response = await fetch(`${backendApiUrl}/scrappers`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GET /scrappers failed: ${response.status} ${body}`);
  }

  return response.json();
}

async function createScrapper() {
  const response = await fetch(`${backendApiUrl}/scrappers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scrapperId,
      dateStatusChange: new Date().toISOString(),
      state: "run",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`POST /scrappers failed: ${response.status} ${body}`);
  }

  return response.json();
}

function logScrapperState(state) {
  if (state === "run") {
    console.log("Scrapper online");
    ScrapperSniffer();
  }

  if (state === "pause") {
    console.log("Scrapper Pause");
    return;
  }

  if (state === "error") {
    console.log("Scrapper Error");
    return;
  }

  console.log(`[scrapper] Unknown state: ${state}`);
}

async function main() {
  console.log(`[scrapper] Service demarre. Backend cible: ${backendApiUrl}`);

  if (!Number.isInteger(scrapperId)) {
    throw new Error("SCRAPPER_ID must be a valid integer");
  }

  const scrappers = await fetchScrappers();
  const existingScrapper = scrappers.find(
    (item) => item.scrapperId === scrapperId,
  );

  if (!existingScrapper) {
    await createScrapper();
    console.log("Scrapper start");
    return;
  }

  logScrapperState(existingScrapper.state);
}

main().catch((error) => {
  console.error("[scrapper] Startup failed", error);
  process.exitCode = 1;
});

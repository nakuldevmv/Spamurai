import puppeteer from "puppeteer";

export async function launchSecureBrowser() {
  // 1. Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',           // or just `true`
    args: [
      '--no-sandbox',           // generally needed in Docker
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-sync',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--disable-translate',
      '--disable-notifications',
      '--mute-audio',
      '--no-default-browser-check',
    ],
    // puppeteer.launch doesn’t support ignoreHTTPSErrors here
  });

  // 2. Open a new page, telling it to ignore HTTPS errors
  const page = await browser.newPage({
    ignoreHTTPSErrors: true,
  });

  // 3. Block unwanted resources
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    const url = req.url();
    const blocked = ['image', 'media', 'font', 'stylesheet', 'script'];
    const sketchy = ['ads', 'tracking', 'analytics', 'beacon', 'pixel'];

    if (blocked.includes(resourceType) || sketchy.some(term => url.includes(term))) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // 4. Return both so caller can navigate / close
  return { browser, page };
}

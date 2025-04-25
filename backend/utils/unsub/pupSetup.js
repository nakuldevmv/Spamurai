import puppeteer from "puppeteer";

export async function launchSecureBrowser() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
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
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    const url = req.url();
    const blocked = ['image', 'media', 'font', 'stylesheet', 'script'];
    const sketchy = ['ads', 'tracking', 'analytics', 'beacon', 'pixel'];

    if (blocked.includes(resourceType) || sketchy.some(bad => url.includes(bad))) {
      req.abort();
    } else {
      req.continue();
    }
  });

  return { browser, page };
}

// import puppeteer from "puppeteer";
import { chromium } from 'playwright';

export async function launchSecureBrowser() {
  const browser = await chromium.launch({
    // const browser = await puppeteer.launch({

    // headless: 'new',
    headless: true,
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
    // ignoreHTTPSErrors: true,
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const req = route.request();
    const resourceType = req.resourceType();
    const url = req.url();
    const blocked = ['image', 'media', 'font', 'stylesheet', 'script'];
    const sketchy = ['ads', 'tracking', 'analytics', 'beacon', 'pixel'];

    if (blocked.includes(resourceType) || sketchy.some(bad => url.includes(bad))) {
      route.abort();
    } else {
      route.continue();
    }
  });
  // await page.setRequestInterception(true);
  // page.on('request', (req) => {
  //   const resourceType = req.resourceType();
  //   const url = req.url();
  //   const blocked = ['image', 'media', 'font', 'stylesheet', 'script'];
  //   const sketchy = ['ads', 'tracking', 'analytics', 'beacon', 'pixel'];

  //   if (blocked.includes(resourceType) || sketchy.some(bad => url.includes(bad))) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });

  return { browser, page };
}

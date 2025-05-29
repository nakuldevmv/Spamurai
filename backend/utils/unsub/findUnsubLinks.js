import * as cheerio from 'cheerio';
export async function findUnsubLinks(parsedEmail) {
  const links = [];

  // look in headers
  const headerValue =await parsedEmail.headers.get('list-unsubscribe');
  if (headerValue) {
    const parts = headerValue.split(',');
    for (let part of parts) {
      const match = part.match(/<([^>]+)>/);
      if (match) links.push(match[1].trim());
    }
  }

  // look in HTML body
  if (await parsedEmail.html) {
    const $ = cheerio.load(await parsedEmail.html);
    $('a').each((i, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr('href');

      const isUnsubLink =
        text.includes('unsubscribe') ||
        text.includes('opt-out') ||
        text.includes('manage preferences') ||
        text.includes('update preferences') ||
        text.includes('manage notifications') ||
        text.includes('email settings') ||
        text.includes('stop receiving') ||
        text.includes('reply stop') ||
        text.includes('email preferences');

      if (isUnsubLink && href) {
        links.push(href);
      }
    });
  }


  return [...new Set(links)];
}

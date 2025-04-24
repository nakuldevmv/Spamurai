import cheerio from 'cheerio';
export function findUnsubLinks(parsedEmail) {
  // console.log(parsedEmail.html);
    const links = [];
  
    // look in headers
    const headerValue = parsedEmail.headers.get('list-unsubscribe');
    if (headerValue) {
      const parts = headerValue.split(',');
      for (let part of parts) {
        const match = part.match(/<([^>]+)>/);
        if (match) links.push(match[1].trim());
      }
    }
  
    // look in HTML body
    // if (parsedEmail.html) {
    //   const regex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
    //   let match;
    //   while ((match = regex.exec(parsedEmail.html)) !== null) {
    //     if (match[2].toLowerCase().includes('unsubscribe')) {
    //       links.push(match[1]);
    //     }
    //   }
    // }
    if (parsedEmail.html) {
      const $ = cheerio.load(parsedEmail.html);
      $('a').each((i, el) => {
        const text = $(el).text().toLowerCase();
        const href = $(el).attr('href');
    
        const isUnsubLink =
          text.includes('unsubscribe') ||
          text.includes('opt-out') ||
          text.includes('manage preferences');
    
        if (isUnsubLink && href) {
          links.push(href);
        }
      });
    }
    
  
    return [...new Set(links)]; 
  }
  
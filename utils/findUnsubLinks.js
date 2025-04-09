// utils/findUnsubLinks.js
export function findUnsubLinks(parsedEmail) {
    const links = [];
  
    // Step 1: look in headers
    const headerValue = parsedEmail.headers.get('list-unsubscribe');
    if (headerValue) {
      const parts = headerValue.split(',');
      for (let part of parts) {
        const match = part.match(/<([^>]+)>/);
        if (match) links.push(match[1].trim());
      }
    }
  
    // Step 2: look in HTML body
    if (parsedEmail.html) {
      const regex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
      let match;
      while ((match = regex.exec(parsedEmail.html)) !== null) {
        if (match[2].toLowerCase().includes('unsubscribe')) {
          links.push(match[1]);
        }
      }
    }
  
    return [...new Set(links)]; // Deduplicate
  }
  
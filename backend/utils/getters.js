import psl from 'psl';


export function getMail(email) {
    // let mail = email.toString().slice(email.indexOf('<') + 1, email.indexOf('>')).trim();
    return email.value[0].address;
}

export function getName(email) {
    // let name = email.slice(1, email.indexOf('<')).trim();
    // name = name.slice(0, name.length - 1);
    return email.value[0].name;
}

export function getDomain(link) {
    try {
      // Bail if link is empty, not a string, or doesn't even start with http
      if (!link || typeof link !== 'string' || !link.startsWith('http')) {
        throw new Error('Invalid link format');
      }
  
      const hostname = new URL(link).hostname;
      const parsed = psl.parse(hostname);
      return parsed.domain || hostname;
    } catch (err) {
      console.log(`🚫 Skipping invalid URL in getDomain(): ${link}`);
      return null;
    }
  }

export function getdate() {
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return formattedDate;

}


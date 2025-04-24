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
  console.log(getDomain('https://www.reddit.com/mail/unsubscribe/1n5r5f655c/2/a846021150c79e98ebfa4adbcdbcc00899200299d4ec61648e0299948064c0f9?%2524web_only=true&correlation_id=c087ee64-df06-4e34-80f2-3025ee2a4fab&%25243p=e_as&_branch_match_id=1253683608795529706&_branch_referrer=H4sIAAAAAAAAA22Qy2rEMAxFvyazy4zjV%2BPCUEpLf8P4oWRMEzvIDqGbfns1tIUuChLWPdJFwrfWtvp4uSDEmNrZbdt5Sfn9IranjkuxXcG6eqKyYJpTdovdcbne7q5OPHf8jeI4jvOPP5SVwOrSQs%2Be6%2B5rwOSB1JAVqkkrFUhwSjdKzfgwKBYeDJgR%2FOSkiz5QBMZGYzhj3JgoIehByxHuysiRaRnYZDpByxWXB3hb8vLRideGO63SoSDC4loq2aZIPLDxAUDLPk5M9xKE7Ec28V4wrgC4k5Pz5EOYaBju59uYZqjtG9rg1s2lOf%2FfrWXHAL89gntbbSi5QW5E%2F3zD6ZPmATHl2XosRwW8vtywrPAFoOAnIYgBAAA%3D'))

export function getdate() {
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return formattedDate;

}


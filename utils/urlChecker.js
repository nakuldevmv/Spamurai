import dotenv from 'dotenv';
// import virustotal from './scanners/virustotal.js';
import ipqs from './scanners/ipqs.js';
dotenv.config();

export default async function checkUrl(url) {
  const ipqsData = await ipqs(url);

  if (ipqsData?.unsafe || ipqsData?.spamming || ipqsData?.malware || ipqsData?.phishing ||
    ipqsData?.suspicious || ipqsData?.adult || ipqsData?.risky_tld || ipqsData?.risk_score >= 70) {
      return "Unsafe ⚠️";

  } else if (ipqsData?.redirected && !normalizeDomain(ipqsData?.final_url).includes(normalizeDomain(ipqsData?.root_domain))) {
    return "Unsafe ⚠️";


  } else {
    //temporarly disabled VirusTotal
    // const vtData = await virustotal(url);
    // if (vtData?.malicious >= 1 || vtData?.suspicious >= 1) {
    //   return "Unsafe ⚠️ by VT";

    // } else {
      return "Safe ✅";

    // }
  }
}

function normalizeDomain(domain) {
  return domain.replace(/^www\./, '').toLowerCase();
}


// checkUrl('https://pornhub.com');
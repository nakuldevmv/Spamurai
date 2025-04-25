import dotenv from 'dotenv';
import ipqs from './scanners/ipqs.js';
dotenv.config();

export default async function checkUrl(url) {
  const ipqsData = await ipqs(url);

  if (ipqsData?.unsafe || ipqsData?.spamming || ipqsData?.malware || ipqsData?.phishing ||
    ipqsData?.suspicious || ipqsData?.adult || ipqsData?.risky_tld || ipqsData?.risk_score >= 80) {
      console.log("Link Status : Unsafe ⚠️");
      return false;

  } else if (ipqsData?.redirected && !normalizeDomain(ipqsData?.final_url).includes(normalizeDomain(ipqsData?.root_domain))) {
    console.log("Link Status : Unsafe ⚠️");
    return false;


  } else {
      console.log("Link Status : Safe ✅");
      return true;
  }
}

function normalizeDomain(domain) {
  return domain.replace(/^www\./, '').toLowerCase();
}



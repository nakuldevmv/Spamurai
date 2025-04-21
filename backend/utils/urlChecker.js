import dotenv from 'dotenv';
// import virustotal from './scanners/virustotal.js';
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
    //temporarly disabled VirusTotal
    // const vtData = await virustotal(url);
    // if (vtData?.malicious >= 1 || vtData?.suspicious >= 1) {
    //   return "Unsafe ⚠️ by VT";

    // } else {
      console.log("Link Status : Safe ✅");
      return true;

    // }
  }
}

function normalizeDomain(domain) {
  return domain.replace(/^www\./, '').toLowerCase();
}


// checkUrl('https://www.geeksforgeeks.org/notifications/?%2FinYDYBj=smmES9431w%3D%3D&5CjUGIBp=uw%3D%3D&%2BD%2FPCYBkhEKILw%3D%3D=ug%3D%3D&%2ByjYGYx1hHOCLvr6ItY%3D=ummMINg00g%3D%3D&mode=unsubscribe');
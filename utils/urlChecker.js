import dotenv from 'dotenv';

dotenv.config();
async function checkUrl(url) {
  // ipqs(url);
  if (data.unsafe || data.phishing || data.risk_score > 70) {
    console.log(`🚨 High risk: ${url}`);
  } else if (data.redirected && !data.final_url.includes(data.root_domain)) {
    console.log(`⚠️ Suspicious redirect from ${data.root_domain} to ${data.final_url}`);
  } else {
    console.log(`✅ Looks safe: ${url}`);
  }
}

checkUrl('https://paypal.com');
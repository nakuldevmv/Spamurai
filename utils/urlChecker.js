import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
async function checkUrl(url) {
    const apiKey = process.env.IPQ_API_KEY;
    const encodedURL = encodeURIComponent(url);
    const apiUrl = `https://ipqualityscore.com/api/json/url/${apiKey}/${encodedURL}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);
        if (data.unsafe || data.phishing || data.risk_score > 70) {
            console.log(`🚨 High risk: ${url}`);
          } else if (data.redirected && !data.final_url.includes(data.root_domain)) {
            console.log(`⚠️ Suspicious redirect from ${data.root_domain} to ${data.final_url}`);
          } else {
            console.log(`✅ Looks safe: ${url}`);
          }
          
    } catch (err) {
        console.log(err);
    }
}

checkUrl('https://paypal.com');
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
async function ipqs(url) {
    const apiKey = process.env.IPQ_API;
    const encodedURL = encodeURIComponent(url);
    const apiUrl = `https://ipqualityscore.com/api/json/url/${apiKey}/${encodedURL}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data.message);
        
          
    } catch (err) {
        console.log(err);
    }
}

ipqs('https://paypal.com');
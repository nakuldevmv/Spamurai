import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export default async function ipqs(url) {
    const apiKey = process.env.IPQ_API;
    const encodedURL = encodeURIComponent(url);
    const apiUrl = `https://ipqualityscore.com/api/json/url/${apiKey}/${encodedURL}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (err) {
        console.log("👀  Couldn’t verify — API died or link buggin");
    }
}


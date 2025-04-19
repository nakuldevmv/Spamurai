import axios from 'axios';
// import puppeteer from 'puppeteer';

export default async function isCaptcha(link, pageContent = null) {
    const CAPTCHA_KEYWORDS = [
        "recaptcha",
        "g-recaptcha",
        "data-sitekey",
        "data-callback",
        "g-recaptcha-response",
        "recaptcha/api.js",
        "recaptcha__en.js",
        "recaptcha/api2/anchor",
        "hcaptcha",
        "h-captcha",
        "data-hcaptcha-sitekey",
        "hcaptcha/api.js",
        "hcaptcha-challenge",
        "cf-turnstile",
        "turnstile.js",
        "challenges.cloudflare.com/turnstile",
        "captcha",
        "captcha-container",
        "captcha-image",
        "captcha-input",
        "i'm not a robot",
        "verify you're human",
        "bot verification"
    ];

    try {
        if (pageContent) {
            const html = pageContent.toLowerCase();
            return CAPTCHA_KEYWORDS.some(word => html.includes(word));
        }

        const { data } = await axios.get(link);
        const lowerHTML = data.toLowerCase();
        return CAPTCHA_KEYWORDS.some(word => lowerHTML.includes(word));

    } catch (err) {
        console.warn("⚠️ CAPTCHA detection failed:", err.message);
        return false;
    }
}

// export default async function isCaptcha(link) {
//     const CAPTCHA_KEYWORDS = [
//         "recaptcha",
//         "g-recaptcha",
//         "data-sitekey",
//         "data-callback",
//         "g-recaptcha-response",
//         "recaptcha/api.js",
//         "recaptcha__en.js",
//         "recaptcha/api2/anchor",
//         "hcaptcha",
//         "h-captcha",
//         "data-hcaptcha-sitekey",
//         "hcaptcha/api.js",
//         "hcaptcha-challenge",
//         "cf-turnstile",
//         "turnstile.js",
//         "challenges.cloudflare.com/turnstile",
//         "captcha",
//         "captcha-container",
//         "captcha-image",
//         "captcha-input",
//         "i'm not a robot",
//         "verify you're human",
//         "bot verification"
//     ];

//     try {
//         const { data } = await axios.get(link);
//         const lowerHTML = data.toLowerCase();
//         if (CAPTCHA_KEYWORDS.some(word => lowerHTML.includes(word))) {
//             return true;
//         }
//     } catch (err) {
//         console.warn("⚠️ Axios failed:", err.message);
//         // fallback even if Axios fails
//     }

//     try {
//         const browser = await puppeteer.launch({ headless: true });
//         const page = await browser.newPage();
//         await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
//         const html = (await page.content()).toLowerCase();
//         await browser.close();
//         return CAPTCHA_KEYWORDS.some(word => html.includes(word));
//     } catch (err) {
//         console.error("💥 Puppeteer failed:", err.message);
//         return false; // or throw depending on your use case
//     }
// }

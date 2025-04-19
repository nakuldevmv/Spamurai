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

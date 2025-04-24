import isCaptcha from "./captcha.js";
import { launchSecureBrowser } from "./pupSetup.js";

export default async function unsuber(link) {
    const { browser, page } = await launchSecureBrowser();


    try {
        const response = await page.goto(link, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const statusCode = [200, 204, 206];
        if (!statusCode.includes(response.status())) {
            console.log("🚫 The link is not valid or the page does not exist.");
            return false;
        }

        console.log("🔗 Link opened successfully!");
        const pageContent = await page.content();

        if (await isCaptcha(link, pageContent)) {
            console.log("🧱 CAPTCHA detected via HTML sniff!");
            return false;
        }

        const unsubElement = await page.evaluateHandle(() => {
            const keywords = ['unsubscribe', 'opt out', 'remove', 'stop receiving', 'no longer receive', 'cancel subscription', 'manage preferences'];
            const elements = [...document.querySelectorAll('button, input, a')];

            for (const elm of elements) {
                const text = (elm.innerText ||
                    elm.value ||
                    elm.getAttribute('aria-label') ||
                    elm.getAttribute('title') ||
                    elm.getAttribute('name') || '').toLowerCase();
                const isVisible = elm.offsetParent !== null;

                if (isVisible && keywords.some(keyword => text.includes(keyword))) {
                    return elm;
                }
            }
            return false;
        });

        const elementIsReal = await unsubElement.jsonValue();

        if (!elementIsReal) {
            console.log("ℹ️  No visible unsubscribe element.");
            if (pageContent.toLowerCase().includes("you have been unsubscribed") ||
                pageContent.toLowerCase().includes("successfully removed") ||
                pageContent.toLowerCase().includes("you're unsubscribed") ||
                pageContent.toLowerCase().includes("unsubscribed") ||
                pageContent.toLowerCase().includes("successfull")) {
                console.log("✅ Detected auto-unsubscribe confirmation on page.");
                return true;
            } else {
                console.log("❓ Could be auto-unsub... or not. No confirmation text found.");
                return false;
            }
        }

        await unsubElement.evaluate(elm => elm.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await unsubElement.click();
        await page.waitForNetworkIdle();
        console.log("👋 Unsubscribe element clicked!");
        return true;

    } catch (error) {
        console.log("💥 Error while unsubbing:", error.message);
        return false;
    } finally {
        await browser.close();
    }
}

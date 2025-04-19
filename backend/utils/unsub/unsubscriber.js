import puppeteer from "puppeteer";
import isCaptcha from "./captcha.js";

export default async function unsuber(link) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let response;
    try {
        response = await page.goto(link, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
    } catch (error) {
        console.warn("🛑 Skipping link. Reason:", error.message);
        await browser.close();
        return;
    }

    const statusCode = [200, 204, 206]
    if (statusCode.includes(response.status())) {
        try {
            console.log("🔗 Link opened successfully!");
            // await page.waitForNetworkIdle();
            const pageContent = await page.content();
            if (await isCaptcha(link, pageContent)) {
                console.log("🧱 CAPTCHA detected via HTML sniff!");
                // await page.screenshot({ path: 'captcha_detected.png' });
                await browser.close();
                return;
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

            if (unsubElement) {
                const elementIsReal = await unsubElement.jsonValue();
                if (!elementIsReal) {
                    console.log("ℹ️  No visible unsubscribe element.");
                    if (pageContent.toLowerCase().includes("you have been unsubscribed") ||
                        pageContent.toLowerCase().includes("successfully removed") ||
                        pageContent.toLowerCase().includes("you're unsubscribed") ||
                        pageContent.toLowerCase().includes("unsubscribed") ||
                        pageContent.toLowerCase().includes("successfull")) {
                        console.log("✅  Detected auto-unsubscribe confirmation on page.");
                    } else {
                        console.log("❓  Could be auto-unsub... or not. No confirmation text found.");
                    }
                    await browser.close();
                    return;
                }

                await unsubElement.evaluate(elm => elm.scrollIntoView({ behavior: 'smooth', block: 'center' }));
                await unsubElement.click();
                await page.waitForNetworkIdle();
                console.log("👋 Unsubscribe element clicked!");
                // await page.screenshot({ path: 'result.png' });

            } else {
                console.log("❌ Couldn't find an Unsubscribe element!");
                // await page.screenshot({ path: 'result.png' });

            }

        } catch (error) {
            console.log("💥 Error while unsubbing:", error.message);
            // await page.screenshot({ path: 'result.png' });
        } finally {
            await browser.close();
        }
    } else {
        console.log("🚫  The link is not valid or the page does not exist.");
        await browser.close();
    }

}

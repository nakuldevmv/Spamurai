import puppeteer from "puppeteer";
import isCaptcha from "./captcha.js";

// Test links
// const link = 'https://www.lalal.ai/unsubscribe/?email=jo.cly.n1561%40gmail.com';
// const link = 'https://links.email.lumalabs.ai/f/a/x6rRxxj6vxUKXuKf4wh2NA~~/AAQRxRA~/KonVfcZ8FktdwegSXUuWg1is6wVuAbAzdyoRQFnHhoKfpE9RtQwJ1vJgtYekX9cXI-zw5adhprW4kzajN_OXcgg6sSY1pdpIEGXTQuUbY7wdL46NA9cD3pFmhN6ePHjB2guBeirAw0Xyp6UlAngmdgKqgQLL65TJSnJcFTTEwZiE7iH0vWc9RJ0FNfGQzupLJNk0I9hND5fQGCHaJYXJ8FDtSIKPGsAJnh0G4y3cYPDDNvZHXglo1DmDx3_CT9_cIkJ2W61ftd0y9fJ8v4MUXITPvGPvXoXOry-nsYldO_cfRYJqZz8RfrnhKB_CYaqa5k9NAdvefC3InnS6o0-B47iAMTL-cb3QeWOD3YR4cXa3jcXv8BfOZ0_T9LOuhcv3yB3CaaKV2sXajK6yqbGMIxt7dVdvw8YaArZkmNVcrOi7qF-YQsJv6ocraj0u4DXHv_-DgNTC67R1ALkRkSHcaEIKn4AZWuHcYEGcvsyPoheh4R_Tg6gJGL8_GZW_kUrw8OmfTUlSfEjc4Prwyz-Sz75zZr-F2q3V-ubiwwuKvj406EOs6WixbYzfpJ-xsg7Q-xBHuvozXXue5wXFQ2zbYki3WMVUfSUWwqyb2pdGRMvaR5awJZbVb9dudxccsZcTNo84AX0ozm2Yn-cSYQn77IU7NGyfvzsIQiywZkBJXbU~'
// const link = 'https://www.ipqualityscore.com/user/manage/notifications/9q37lQU4z9Q0WdigvI1JrUDVVj500x9lfKAPE0UCa75pFSnu9tr6HnaC3AkOmaYnVI2slycqbQ0adCtkyagRiBWmGgY9PVGnxiMLFNtm4rjqKeKY4cYNJQIEoEh3bx25feBuAdHzkfiHi23LwBTChXck2v0XZb5VlXHwSDsFNY0QNNnUIRI5XDsJWUf4E6sVKsfuqw4rPpqLDMi0j36disg7lHVrLO7ZM5NjP9uColE2hHHDJP1BSt3cBvsnh1FULdq8FoCZIums68WHGMfBtWGbHlfLsz8upDZidJOi5HEr8g26EIbPFxcYZbIGFqM56NtGhFjoPuBXTd1137qLrIL7dQAos3rj';
// const link = 'https://hs-20988450.s.hubspotemail.net/hs/preferences-center/en/direct?data=W2nXS-N30h-BdW1LvFCk1NmM4mW4hwQq22YGBxNW4mdsyB3z0TQRW4m98SP4prtBQW32KbT94rhkXrW2TxVNd21455XW1QlGwK2KZlWGW2YsLb147FrQKW3R1VVb4phzcGW255pBN1YZtyvW3dr7Xs4r5QmHW3XQ9d038CbkMW4mFwg83g0rFXW1SxYfG3_RRGjW3Fg8Nw2z_2rRW1Bv8B649skXyW1Z5ncK4r7THfW1BNbL236yzS1W23f8b53F5VQTW3BYTMw34f7QdW34vlYh3VM_84W2-MPhG2t4y5YW41StNl3g7664W2CMNx92RCRcVW2qMZGs49NkdTW3P5SjQ3JHYmfW3B_pF34hFwm3W4ft4gd3bCs6qW30KwKG1N86nFW3W2Lwm1--8Z2W3b4BQ83XHDw-W2p8nf84fPC6SW4rq5hY1QsYd1W2HT_KS2PQWKHW3Fgz0S2PSvGXW1V1F8b2MwqlCW34zzhX2PzX4RW364vWR41Zj3WW22XfN14mszYgW3Kd7VY3BNgK1W3Hc4n72zxSk2W2p8l7C21ljSVW3LTnYx23nc5PW1S1RZZ1Z72bhW2Cwpky2-rD_bf4hpCyX04&amp;utm_campaign=AI%20Simplified%20Newsletter&amp;utm_source=hs_email&amp;utm_medium=email&amp;utm_content=354576246&amp;_hsenc=p2ANqtz-81Ijuachg1rFQFrfd7QCNrFi5z9B8D1NIFu8LW3YFILFxQVkFxL8r0ACUMYEg6eScvqpDZ87Cm2tF-jHEReys12pi7Tw&amp;_hsmi=354576246'

export default async function unsub(link) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const response = await page.goto(link, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });
    const statusCode = [200, 204, 206]
    if (statusCode.includes(response.status())) {
        try {
            console.log("🔗 Link opened successfully!");
            // await page.waitForNetworkIdle();
            const pageContent = await page.content();
            if (await isCaptcha(link, pageContent)) {
                console.log("🧱 CAPTCHA detected via HTML sniff!");
                await page.screenshot({ path: 'captcha_detected.png' });
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
                await page.screenshot({ path: 'result.png' });

            } else {
                console.log("❌ Couldn't find an Unsubscribe element!");
                await page.screenshot({ path: 'result.png' });

            }

        } catch (error) {
            console.log("💥 Error while unsubbing:", error.message);
            await page.screenshot({ path: 'result.png' });
        } finally {
            await browser.close();
        }
    } else {
        console.log("🚫  The link is not valid or the page does not exist.");
        await browser.close();
    }

}

// unsub(link);
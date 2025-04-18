import puppeteer from 'puppeteer';

async function unsubscribe(link) {
    const browser = await puppeteer.launch({ headless: false }); // show browser for debugging
    const page = await browser.newPage();

    try {
        console.log(`🔍 Navigating to: ${link}`);
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for page to settle
        await page.waitForNetworkIdle();

        // Try to find anything that smells like an "unsubscribe" button
        const unsubscribeElement = await page.evaluateHandle(() => {
            const keywords = ['unsubscribe', 'opt out', 'remove'];
            const elements = [...document.querySelectorAll('button, input, a, div')];

            for (const el of elements) {
                const text = (el.innerText || el.value || '').toLowerCase();
                const isVisible = el.offsetParent !== null; // ignore hidden elements

                if (isVisible && keywords.some(keyword => text.includes(keyword))) {
                    return el;
                }
            }
            return null;
        });

        if (unsubscribeElement) {
            console.log('🎯 Unsubscribe element found! Clicking...');
            await unsubscribeElement.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await unsubscribeElement.click();

            // wait to see if there’s a redirect or confirmation
            await page.waitForNetworkIdle();
            await page.screenshot({ path: 'unsubscribe_confirmation.png' });

            console.log(`✅ Done! Page title: ${await page.title()}`);
        } else {
            console.log('❌ No unsubscribe element found on this page.');
            await page.screenshot({ path: 'unsubscribe_notfound.png' });
        }

    } catch (error) {
        console.error('💥 Error during unsubscribe:', error.message);
        await page.screenshot({ path: 'unsubscribe_error.png' });
    } finally {
        await browser.close();
    }
}

// Example usage
unsubscribe('https://iterable.links.postman.com/s/u/ba5JhaZs6LvRdWu0JCjmVV3yPX1pn6aSGdDeJhc2e_uX9aq52YQ8IZPHtUVgZYbiRIEODMASHx5J44JY6lkxiqDVLH0jxrQwZH4l3ytZv-NkDDgOZaevcMtFVhbcOHhw2hLmiJdoq7u16kmhQQLiaLTmq4yEXQh4Nnc1y8Vob953tLc77jRq9XxZ3jg/NlQfG3bp_bW4ZFzLjmBODqX8Ey7ABY3-/8')
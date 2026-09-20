const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const locations = ['Lexington, MA', 'Newton, MA', 'Belmont, MA', 'Concord, MA'];

  for (const loc of locations) {
    const searchUrl = `https://www.redfin.com/stingray/api/v1/search/place?location=${encodeURIComponent(loc)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    const text = await page.evaluate(() => document.body.innerText);
    console.log(`\nLocation "${loc}" Place API Response:`);
    console.log(text.slice(0, 500));
  }

  await browser.close();
})();

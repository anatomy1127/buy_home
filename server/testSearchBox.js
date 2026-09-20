const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const towns = ['Lexington, MA', 'Newton, MA', 'Belmont, MA', 'Concord, MA'];

  for (const t of towns) {
    console.log(`\nNavigating to Redfin homepage to search for "${t}"...`);
    await page.goto('https://www.redfin.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Type into search input
    const searchInput = page.locator('input[search-input-box="true"], input[type="search"], input[placeholder*="City"]').first();
    await searchInput.fill(t);
    await page.waitForTimeout(1500);

    // Press enter or click search button
    await searchInput.press('Enter');
    await page.waitForTimeout(4000);

    const currentUrl = page.url();
    const title = await page.title();
    console.log(`Target: "${t}"`);
    console.log(`Resulting URL: ${currentUrl}`);
    console.log(`Resulting Title: ${title}`);
  }

  await browser.close();
})();

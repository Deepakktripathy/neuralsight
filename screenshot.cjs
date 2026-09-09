const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const customModelBtn = buttons.find(b => b.textContent.includes('Custom Model'));
    if (customModelBtn) customModelBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log(text);
  
  await browser.close();
})();

import { chromium } from '/root/.npm/_npx/328e07380a636093/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36' });
const rows = [];
for (const width of [390, 416, 768, 991, 992, 1366, 1600, 1920]) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width, height: Math.round(width * 0.6) + 300 });
  try { await page.goto('https://www.era-residence.com/', { waitUntil: 'load', timeout: 45000 }); } catch (e) { rows.push({ width, error: String(e).slice(0, 60) }); continue; }
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const px = (v) => Math.round(parseFloat(v) * 10) / 10;
    const cs = getComputedStyle(document.body);
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;width:var(--48px);height:var(--_special-units---offset-l)';
    document.body.appendChild(probe);
    const b = probe.getBoundingClientRect();
    const fs = (cls) => { const el = document.querySelector(cls); return el ? px(getComputedStyle(el).fontSize) : null; };
    const out = {
      ratio: cs.getPropertyValue('--_special-units---scale-ratio').trim(),
      rem: px(getComputedStyle(document.documentElement).fontSize),
      u48: px(b.width), margin: px(b.height),
      h1: fs('.h1'), h2: fs('.h2'), a1: fs('.a1'), l1: fs('.l1'), l2: fs('.l2'), p1: fs('.p1'), c1: fs('.c1'),
      svh: cs.getPropertyValue('--_100svh').trim(),
    };
    probe.remove();
    return out;
  });
  rows.push({ width, ...r });
  await page.close();
}
await browser.close();
console.table(rows);

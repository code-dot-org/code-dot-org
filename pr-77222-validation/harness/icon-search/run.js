// Types each input into the harness search box on both builds and reports whether it throws.
// Usage: node run.js   (needs `playwright` resolvable, e.g. NODE_PATH=$(npm root -g))
const http = require('http');
const fs = require('fs');
const path = require('path');
const {chromium} = require('playwright');

const SHOTS = path.join(__dirname, 'screenshots');
const NAMES = {hand: 'hand', '(': 'paren', 'hand*': 'handstar', 'hand***': 'handstar3', '[': 'bracket', '\\': 'backslash'};

const server = http.createServer((req, res) => {
  const file = path.join(__dirname, req.url.split('?')[0]);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, {'content-type': file.endsWith('.html') ? 'text/html' : 'text/javascript'});
    res.end(data);
  });
});

(async () => {
  fs.mkdirSync(SHOTS, {recursive: true});
  await new Promise(r => server.listen(8765, '127.0.0.1', r));
  const browser = await chromium.launch();
  const results = [];
  for (const build of ['staging', 'pr']) {
    for (const input of Object.keys(NAMES)) {
      const page = await browser.newPage({viewport: {width: 700, height: 400}});
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(e.message));
      await page.goto(`http://127.0.0.1:8765/${build}.html`);
      await page.fill('#search', input);
      await page.waitForTimeout(200);
      const searchAssets = await page.evaluate(q => {
        try { return 'ok:' + window.__searchAssets(q).results.length; }
        catch (e) { return 'THROWS ' + e.message; }
      }, input);
      await page.screenshot({path: path.join(SHOTS, `48g-${build}-${NAMES[input]}.png`)});
      results.push({build, input, pageErrors, searchAssets});
      await page.close();
    }
  }
  console.log(JSON.stringify(results, null, 1));
  await browser.close();
  server.close();
})();

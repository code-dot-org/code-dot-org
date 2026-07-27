// Milestone-5 browser check — the lab in a real browser, end to end.
//
// Unlike the milestone-2/3 spikes (which self-serve), this drives the actual
// dev servers, so start them first:
//   yarn dev         # lab on :5139   (terminal 1)
//   yarn dev:sandbox # sandbox on :5202 (terminal 2)
// or `yarn dev:isolated`. Then:  node spikes/milestone-5/verify.mjs
//
// It opens the lab (which auto-targets the sandbox) and asserts the game renders
// (green sprite in the preview iframe) and the relayed console shows the actor
// landing in the Console box.

import {chromium} from 'playwright';

const CHROME =
  process.env.HOME +
  '/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

let landed = false;
let greenDrawn = false;
let bodyText = '';
let failure;
try {
  await page.goto('http://localhost:5139/', {waitUntil: 'load'});
  // Vite pre-bundles esbuild-wasm + phaser on first load; give it room.
  await page
    .waitForFunction(() => document.body.innerText.includes('Player landed'), {
      timeout: 90000,
    })
    .then(() => (landed = true))
    .catch(() => (landed = false));

  bodyText = await page.evaluate(() => document.body.innerText);

  const previewFrame = page
    .frames()
    .find(f => f.url().includes(':5202/preview.html'));
  if (previewFrame) {
    greenDrawn = await previewFrame.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 1] > 100 && data[i] < 120) return true;
      }
      return false;
    });
  }
} catch (e) {
  failure = e.message;
}

await browser.close();

console.log('preview canvas green =', greenDrawn, '| landed =', landed);
console.log(
  'console box (excerpt):\n' +
    (bodyText
      .split('\n')
      .filter(l => /player|error|falling|landed/i.test(l))
      .join('\n') || '(none)'),
);
if (errors.length) console.log('page errors:', JSON.stringify(errors));
if (failure) console.log('failure:', failure);

const checks = [
  ['preview iframe rendered the actor (green sprite)', greenDrawn],
  ['relayed console shows the actor landed', landed],
  ['no page errors', errors.length === 0],
];
let ok = true;
console.log('\n── assertions ──');
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);

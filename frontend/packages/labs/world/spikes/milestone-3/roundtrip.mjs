// Milestone-3 verification: a learner project that imports `world-lab` compiles,
// loads in the preview, and the Phaser binding renders it — a gravity-driven
// actor falls and lands. Across two real origins under the production CSPs,
// driving the real managers + engine + Phaser.
//
// Run:  yarn setup:world && node spikes/milestone-3/roundtrip.mjs

import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import * as esbuild from 'esbuild';
import {chromium} from 'playwright';

const HERE = new URL('.', import.meta.url).pathname;
const PKG = `${HERE}../../`;
const CHROME =
  process.env.HOME +
  '/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

const harness = (
  await esbuild.build({
    entryPoints: [`${HERE}harness.ts`],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    logLevel: 'silent',
  })
).outputFiles[0].text;

// The sandbox entry, split so the preview chunk carries Phaser and the compile
// chunk carries esbuild-wasm; `world-lab` is type-only in the driver (erased).
const sandboxBuild = await esbuild.build({
  entryPoints: [`${PKG}src/runtime/sandbox/entry.ts`],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  splitting: true,
  outdir: 'out',
  write: false,
  logLevel: 'silent',
});
const sandboxAssets = new Map();
for (const file of sandboxBuild.outputFiles) {
  sandboxAssets.set('/' + file.path.replace(/^.*out[\\/]/, ''), file.text);
}

const swCode = readFileSync(`${PKG}public/worldBuildServiceWorker.js`);
const esbuildWasm = readFileSync(`${PKG}public/vendor/esbuild.wasm`);
const worldLab = readFileSync(`${PKG}public/vendor/world-lab.mjs`);

const COMPILE_CSP =
  "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'";
const PREVIEW_CSP =
  "default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' blob: data:";

const sandboxHtml =
  `<!doctype html><html><head><meta charset="utf-8"></head>` +
  `<body style="margin:0"><div id="game" style="width:400px;height:300px"></div>` +
  `<script type="module" src="/entry.js"></script></body></html>`;

const sandbox = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (body, type, headers = {}) =>
    res.writeHead(200, {'Content-Type': type, ...headers}).end(body);
  if (url.pathname === '/compile.html')
    return send(sandboxHtml, 'text/html', {
      'Content-Security-Policy': COMPILE_CSP,
    });
  if (url.pathname === '/preview.html')
    return send(sandboxHtml, 'text/html', {
      'Content-Security-Policy': PREVIEW_CSP,
    });
  if (sandboxAssets.has(url.pathname))
    return send(sandboxAssets.get(url.pathname), 'text/javascript');
  if (url.pathname === '/worldBuildServiceWorker.js')
    return send(swCode, 'text/javascript', {'Service-Worker-Allowed': '/'});
  if (url.pathname === '/vendor/esbuild.wasm')
    return send(esbuildWasm, 'application/wasm');
  if (url.pathname === '/vendor/world-lab.mjs')
    return send(worldLab, 'text/javascript');
  res.writeHead(404).end('not found');
});

const lab = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/' || url.pathname === '/index.html')
    return res
      .writeHead(200, {'Content-Type': 'text/html'})
      .end(
        `<!doctype html><html><head><meta charset="utf-8"></head>` +
          `<body><script type="module" src="/harness.js"></script></body></html>`,
      );
  if (url.pathname === '/harness.js')
    return res.writeHead(200, {'Content-Type': 'text/javascript'}).end(harness);
  res.writeHead(404).end('not found');
});

await new Promise(r => sandbox.listen(0, r));
await new Promise(r => lab.listen(0, r));
const sandboxPort = sandbox.address().port;
const labPort = lab.address().port;

// A learner project: a gravity world with a falling player and a ground.
const PROJECT = {
  'scenes/main.js': `
import {SceneBuilder, WorldBuilder, ActorBuilder, GravityRule,
  AffectedByGravityTrait, GroundTrait, PositionProperty,
  StartsFallingEvent, StopsFallingEvent, Vector} from 'world-lab';
const scene = new SceneBuilder({id: 'game', name: 'Game'});
scene.useWorld(new WorldBuilder({id: 'w', name: 'W'}).useRules([GravityRule]));
const player = scene.addActor(new ActorBuilder({id: 'player', name: 'Player'})
  .useTraits([AffectedByGravityTrait]).set(PositionProperty, new Vector(200, 20)));
scene.addActor(new ActorBuilder({id: 'ground', name: 'Ground'})
  .useTraits([GroundTrait]).set(PositionProperty, new Vector(200, 260)));
player.on(StartsFallingEvent, () => console.log('player started falling'));
player.on(StopsFallingEvent, () => console.log('player landed'));
export default scene;
`,
};

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

let result,
  failure,
  consoleLines = [],
  greenDrawn = false;
try {
  await page.goto(
    `http://localhost:${labPort}/?world-sandbox=http://localhost:${sandboxPort}/`,
    {waitUntil: 'load'},
  );
  await page.waitForFunction(() => window.__ready === true, {timeout: 15000});
  result = await page.evaluate(
    ([files, entry]) => window.__roundtrip(files, entry),
    [PROJECT, 'scenes/main.js'],
  );
  // Let the game run so gravity carries the actor to the ground.
  await page.waitForTimeout(2000);
  consoleLines = await page.evaluate(() => window.__console);
  const previewFrame = page
    .frames()
    .find(f => f.url().includes('preview.html'));
  greenDrawn = previewFrame
    ? await previewFrame.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 1] > 100 && data[i] < 120) return true; // the green actor
        }
        return false;
      })
    : false;
} catch (e) {
  failure = e.message;
}

await browser.close();
sandbox.close();
lab.close();

console.log('result:', JSON.stringify(result));
console.log('relayed console:', JSON.stringify(consoleLines));
if (errors.length) console.log('page errors:', JSON.stringify(errors));
if (failure) console.log('failure:', failure);

const checks = [
  ['round-trip resolved (module compiled, loaded, game built)', !!result],
  ['the game rendered the actor (green sprite on canvas)', greenDrawn],
  [
    'gravity ran: actor started falling',
    consoleLines.some(l => l.includes('player started falling')),
  ],
  [
    'collision ran: actor landed on the ground',
    consoleLines.some(l => l.includes('player landed')),
  ],
  ['no page errors', errors.length === 0],
];

let ok = true;
console.log('\n── assertions ──');
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);

// Milestone-4 verification: Level-1 hot reload. Three sequential loads across
// the real two-origin sandbox under the production CSPs:
//   1. base project            -> "built"      (gravity strength 900)
//   2. only strength changed    -> "reconciled" (patched live to 1500, no restart)
//   3. an actor value changed   -> "restarted"  (falls back to Level 0)
//
// Run:  yarn setup:world && node spikes/milestone-4/roundtrip.mjs

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

// ── The three project variants ────────────────────────────────────────────────
const scene = `
import {SceneBuilder, ActorBuilder, GroundTrait, PositionProperty, Vector} from 'world-lab';
import PlatformWorld from 'worlds/platform';
import Player from 'actors/player';
const scene = new SceneBuilder({id:'game', name:'Game'});
scene.useWorld(PlatformWorld);
scene.addActor(Player);
scene.addActor(new ActorBuilder({id:'ground', name:'Ground'}).useTraits([GroundTrait]).set(PositionProperty, new Vector(200,260)));
export default scene;
`;
const player = y => `
import {ActorBuilder, AffectedByGravityTrait, PositionProperty, Vector} from 'world-lab';
export default new ActorBuilder({id:'player', name:'Player'}).useTraits([AffectedByGravityTrait]).set(PositionProperty, new Vector(200, ${y}));
`;
const platform = strength => `
import {WorldBuilder, GravityRule${strength ? ', StrengthProperty' : ''}} from 'world-lab';
export default new WorldBuilder({id:'platform', name:'Platform'}).useRules([GravityRule])${strength ? `.set(StrengthProperty, ${strength})` : ''};
`;

const base = {
  'scenes/main.js': scene,
  'worlds/platform.js': platform(0), // default strength 900
  'actors/player.js': player(20),
};
const strengthChanged = {...base, 'worlds/platform.js': platform(1500)};
const actorChanged = {
  ...base,
  'worlds/platform.js': platform(1500),
  'actors/player.js': player(50),
};

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

let r1, r2, r3, failure;
try {
  await page.goto(
    `http://localhost:${labPort}/?world-sandbox=http://localhost:${sandboxPort}/`,
    {waitUntil: 'load'},
  );
  await page.waitForFunction(() => window.__ready === true, {timeout: 15000});
  const load = (files, entry) =>
    page.evaluate(([f, e]) => window.__load(f, e), [files, entry]);
  r1 = await load(base, 'scenes/main.js');
  r2 = await load(strengthChanged, 'scenes/main.js');
  r3 = await load(actorChanged, 'scenes/main.js');
} catch (e) {
  failure = e.message;
}

await browser.close();
sandbox.close();
lab.close();

console.log('load 1 (base):     ', JSON.stringify(r1));
console.log('load 2 (strength): ', JSON.stringify(r2));
console.log('load 3 (actor):    ', JSON.stringify(r3));
if (errors.length) console.log('page errors:', JSON.stringify(errors));
if (failure) console.log('failure:', failure);

const strength = r => r && r.world && r.world['gravity.strength'];
const checks = [
  [
    'first load is a fresh build at strength 900',
    r1?.mode === 'built' && strength(r1) === 900,
  ],
  ['world-only change reconciles live (no restart)', r2?.mode === 'reconciled'],
  [
    'reconcile patched gravity strength to 1500 in the running world',
    strength(r2) === 1500,
  ],
  ['an actor-value change restarts', r3?.mode === 'restarted'],
  ['no page errors', errors.length === 0],
];

let ok = true;
console.log('\n── assertions ──');
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);

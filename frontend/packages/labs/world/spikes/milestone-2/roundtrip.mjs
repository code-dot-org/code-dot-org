// Milestone-2 verification: the compile → SW → preview round-trip, end to end,
// across two real origins under the production CSPs, driving the REAL managers.
//
// It bundles the lab harness and the sandbox entry with native esbuild, serves
// the lab on one port and the sandbox (compile.html + preview.html + the SW +
// the vendored esbuild.wasm) on another with per-surface CSP headers, then drives
// headless chromium: compile a 2-file project, store it in the SW, import it in
// the preview, and assert the module ran (its default export comes back).
//
// Run:  yarn setup:world && node spikes/milestone-2/roundtrip.mjs

import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import * as esbuild from 'esbuild';
import {chromium} from 'playwright';

const HERE = new URL('.', import.meta.url).pathname;
const PKG = `${HERE}../../`;
const CHROME =
  process.env.HOME +
  '/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

// ── Bundle the harness (lab) and the sandbox entry (with code-splitting so the
//    preview surface never pulls in the esbuild-wasm chunk). ──────────────────
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
// Map "/entry.js" and "/chunk-*.js" -> code.
const sandboxAssets = new Map();
for (const file of sandboxBuild.outputFiles) {
  sandboxAssets.set('/' + file.path.replace(/^.*out[\\/]/, ''), file.text);
}

const swCode = readFileSync(`${PKG}public/worldBuildServiceWorker.js`);
const esbuildWasm = readFileSync(`${PKG}public/vendor/esbuild.wasm`);

const COMPILE_CSP =
  "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'";
const PREVIEW_CSP =
  "default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' blob: data:";

const sandboxHtml = entryScript =>
  `<!doctype html><html><head><meta charset="utf-8"></head>` +
  `<body><div id="game"></div>` +
  `<script type="module" src="${entryScript}"></script></body></html>`;

// ── Sandbox origin server ─────────────────────────────────────────────────────
const sandbox = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (body, type, headers = {}) =>
    res.writeHead(200, {'Content-Type': type, ...headers}).end(body);

  if (url.pathname === '/compile.html') {
    return send(sandboxHtml('/entry.js'), 'text/html', {
      'Content-Security-Policy': COMPILE_CSP,
    });
  }
  if (url.pathname === '/preview.html') {
    return send(sandboxHtml('/entry.js'), 'text/html', {
      'Content-Security-Policy': PREVIEW_CSP,
    });
  }
  if (sandboxAssets.has(url.pathname)) {
    return send(sandboxAssets.get(url.pathname), 'text/javascript');
  }
  if (url.pathname === '/worldBuildServiceWorker.js') {
    return send(swCode, 'text/javascript', {'Service-Worker-Allowed': '/'});
  }
  if (url.pathname === '/vendor/esbuild.wasm') {
    return send(esbuildWasm, 'application/wasm');
  }
  res.writeHead(404).end('not found');
});

// ── Lab origin server ─────────────────────────────────────────────────────────
const lab = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return res
      .writeHead(200, {'Content-Type': 'text/html'})
      .end(
        `<!doctype html><html><head><meta charset="utf-8"></head>` +
          `<body><script type="module" src="/harness.js"></script></body></html>`,
      );
  }
  if (url.pathname === '/harness.js') {
    return res.writeHead(200, {'Content-Type': 'text/javascript'}).end(harness);
  }
  res.writeHead(404).end('not found');
});

await new Promise(r => sandbox.listen(0, r));
await new Promise(r => lab.listen(0, r));
const sandboxPort = sandbox.address().port;
const labPort = lab.address().port;

// ── Drive ─────────────────────────────────────────────────────────────────────
const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const consoleLines = [];
page.on('console', m => consoleLines.push(m.text()));
const errors = [];
page.on('pageerror', e => errors.push(e.message));

const PROJECT = {
  'scenes/main.js':
    "import v from './val.js'; console.log('world module ran, v=' + v); export default v;",
  'scenes/val.js': 'export default 42;',
};

let result, failure;
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
} catch (e) {
  failure = e.message;
}

await browser.close();
sandbox.close();
lab.close();

// ── Report ────────────────────────────────────────────────────────────────────
console.log('result:', JSON.stringify(result));
console.log('preview console:', JSON.stringify(consoleLines));
if (errors.length) console.log('page errors:', JSON.stringify(errors));
if (failure) console.log('failure:', failure);

const checks = [
  ['round-trip resolved', !!result],
  [
    'module URL is on the sandbox origin build path',
    !!result && result.url.includes(`:${sandboxPort}/__world_build__/`),
  ],
  [
    'preview imported + ran the compiled module (default === 42)',
    result?.detail === 42,
  ],
  [
    'the module actually executed in the preview',
    consoleLines.some(l => l.includes('world module ran, v=42')),
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

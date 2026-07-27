// Milestone-0 Spike C driver: browser CSP + import + render.
//
// Bundles the two harness entries with native esbuild, serves them under
// precise per-mode CSP *response headers*, drives the cached Playwright
// chromium, and captures each page's reported result plus any
// securitypolicyviolation events. Answers:
//   Q1 compile surface: does esbuild-wasm init under
//       `script-src 'self' 'wasm-unsafe-eval'`, and does its wasm fetch force
//       `connect-src 'self'`? Is `'wasm-unsafe-eval'` actually required?
//   Q2 preview surface: does Phaser boot + render under bare `script-src 'self'`
//       with zero CSP violations?
//   Q3 transport: can a compiled module be imported from a same-origin URL under
//       `script-src 'self'`, while a blob import needs `blob:`?
//
// Run:  node spikes/milestone-0/spike-c.mjs

import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import * as esbuild from 'esbuild'; // native, for building the harness itself
import {chromium} from 'playwright';

const HERE = new URL('.', import.meta.url).pathname;
const CHROME =
  process.env.HOME +
  '/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

// ── Build the two harness entries (native esbuild) ────────────────────────────
const bundle = async entry =>
  (
    await esbuild.build({
      entryPoints: [`${HERE}browser/${entry}`],
      bundle: true,
      format: 'esm',
      write: false,
      logLevel: 'silent',
    })
  ).outputFiles[0].text;

const compileJs = await bundle('compile-entry.mjs');
const previewJs = await bundle('preview-entry.mjs');
const esbuildWasm = readFileSync(
  `${HERE}../../../../../node_modules/esbuild-wasm/esbuild.wasm`,
);
// A self-contained compiled module (no external), for the same-origin import.
const compiledMjs = 'export default "from-same-origin";';

// ── CSP per mode ──────────────────────────────────────────────────────────────
const CSP = {
  // compile-surface variants
  'compile-none':
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'none'",
  'compile-self':
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'",
  'compile-noeval': "default-src 'self'; script-src 'self'; connect-src 'self'",
  // preview-surface variants
  'preview-self':
    "default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' blob: data:",
  'preview-selfblob':
    "default-src 'self'; script-src 'self' blob:; connect-src 'none'; img-src 'self' blob: data:",
};

const page = (jsPath, csp) =>
  `<!doctype html><html><head><meta charset="utf-8">` +
  `</head><body><script type="module" src="${jsPath}"></script></body></html>`;

// ── Server: CSP header chosen by ?mode= ───────────────────────────────────────
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const mode = url.searchParams.get('mode');
  const send = (body, type, extra = {}) =>
    res.writeHead(200, {'Content-Type': type, ...extra}).end(body);

  if (url.pathname === '/compile.html') {
    return send(page('/compile.js', CSP[mode]), 'text/html', {
      'Content-Security-Policy': CSP[mode],
    });
  }
  if (url.pathname === '/preview.html') {
    return send(page('/preview.js', CSP[mode]), 'text/html', {
      'Content-Security-Policy': CSP[mode],
    });
  }
  if (url.pathname === '/compile.js') return send(compileJs, 'text/javascript');
  if (url.pathname === '/preview.js') return send(previewJs, 'text/javascript');
  if (url.pathname === '/compiled.mjs')
    return send(compiledMjs, 'text/javascript');
  if (url.pathname === '/esbuild.wasm')
    return send(esbuildWasm, 'application/wasm');
  res.writeHead(404).end('not found');
});

await new Promise(r => server.listen(0, r));
const port = server.address().port;
const base = `http://localhost:${port}`;

// ── Drive chromium ────────────────────────────────────────────────────────────
const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});

async function run(path, mode) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', e =>
      window.__csp.push({
        directive: e.violatedDirective,
        blocked: e.blockedURI,
      }),
    );
  });
  const result = new Promise(resolve => {
    p.on('console', msg => {
      const t = msg.text();
      if (t.startsWith('SPIKE_RESULT '))
        resolve(JSON.parse(t.slice('SPIKE_RESULT '.length)));
    });
  });
  const timeout = new Promise(r => setTimeout(() => r({timeout: true}), 15000));
  await p.goto(`${base}${path}?mode=${mode}`, {waitUntil: 'load'});
  const reported = await Promise.race([result, timeout]);
  const violations = await p.evaluate(() => window.__csp);
  await ctx.close();
  return {reported, violations};
}

const out = {};
out['Q1a compile connect-src:none'] = await run(
  '/compile.html',
  'compile-none',
);
out['Q1b compile connect-src:self'] = await run(
  '/compile.html',
  'compile-self',
);
out['Q1c compile no wasm-unsafe-eval'] = await run(
  '/compile.html',
  'compile-noeval',
);
out['Q2/Q3 preview script-src:self'] = await run(
  '/preview.html',
  'preview-self',
);
out['Q3b preview script-src:self+blob'] = await run(
  '/preview.html',
  'preview-selfblob',
);

await browser.close();
server.close();

// ── Report ────────────────────────────────────────────────────────────────────
for (const [name, {reported, violations}] of Object.entries(out)) {
  console.log(`\n### ${name}`);
  console.log('  result:    ', JSON.stringify(reported));
  console.log('  violations:', JSON.stringify(violations));
}

// ── Assertions (expected outcomes) ────────────────────────────────────────────
const a = [];
const A = out['Q1a compile connect-src:none'].reported;
const B = out['Q1b compile connect-src:self'].reported;
const C = out['Q1c compile no wasm-unsafe-eval'].reported;
const P = out['Q2/Q3 preview script-src:self'].reported;
const Pb = out['Q3b preview script-src:self+blob'].reported;

a.push([
  'Q1: wasm-unsafe-eval + connect-src self → esbuild inits',
  B.ok === true,
]);
a.push([
  'Q1: connect-src none → esbuild fails (wasm fetch blocked)',
  A.ok === false,
]);
a.push([
  "Q1: no 'wasm-unsafe-eval' → esbuild fails (instantiation blocked)",
  C.ok === false,
]);
a.push([
  'Q2: Phaser renders sprite under script-src self',
  !!(P.phaser && P.phaser.spriteDrew),
]);
// The only violation expected on this page is the intentional blob-import
// probe (Q3); assert Phaser itself contributed none.
const previewNonBlob = out['Q2/Q3 preview script-src:self'].violations.filter(
  v => !String(v.blocked).startsWith('blob'),
);
a.push([
  'Q2: no Phaser-attributable CSP violations under self',
  previewNonBlob.length === 0,
]);
a.push([
  'Q3: same-origin module import works under script-src self',
  !!(P.sameOrigin && P.sameOrigin.ok),
]);
a.push([
  'Q3: blob import BLOCKED under script-src self',
  !!(P.blob && P.blob.ok === false),
]);
a.push([
  'Q3: blob import works once blob: added',
  !!(Pb.blob && Pb.blob.ok === true),
]);

console.log('\n── assertions ──');
let ok = true;
for (const [name, pass] of a) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);

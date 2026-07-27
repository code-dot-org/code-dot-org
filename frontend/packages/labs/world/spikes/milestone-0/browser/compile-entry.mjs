// Compile-surface harness entry (Spike C, Q1).
//
// Loads esbuild-wasm, initializes it (the WebAssembly instantiation the compile
// CSP must permit), and bundles a tiny TS snippet with an external import. The
// Node driver serves this page under different CSPs to learn (a) that
// `'wasm-unsafe-eval'` suffices for instantiation and (b) whether the wasm
// *fetch* forces `connect-src 'self'`.
import * as esbuild from 'esbuild-wasm';

const report = r => {
  // eslint-disable-next-line no-console
  console.log('SPIKE_RESULT ' + JSON.stringify(r));
};

try {
  // worker:false runs esbuild on this page's main thread instead of spawning a
  // blob-URL Web Worker — which a tight sandbox CSP (no `worker-src blob:`)
  // would block. The hidden compile surface does nothing else, so blocking it
  // during a sub-100ms bundle is fine.
  await esbuild.initialize({wasmURL: '/esbuild.wasm', worker: false});
  const out = await esbuild.build({
    stdin: {
      contents: `import {x} from 'world-lab'; const y: number = x + 1; export default y;`,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    write: false,
    external: ['world-lab'],
    logLevel: 'silent',
  });
  const code = out.outputFiles[0].text;
  report({
    ok: true,
    initialized: true,
    keptExternal: /from ?["']world-lab["']/.test(code),
    transpiledTs: !/: number =/.test(code),
  });
} catch (e) {
  report({ok: false, error: String(e && e.message ? e.message : e)});
}

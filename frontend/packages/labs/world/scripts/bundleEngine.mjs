// Bundling the engine to the single module the sandbox loads.
//
// The sandbox does not import `src/engine`; it loads `public/vendor/world-lab.mjs`,
// a self-contained ESM bundle, because the compiler rewrites a project's imports
// to exactly one engine instance (PLAN §7 / §10). So an edit to `src/engine` does
// not reach a running game until this has run again — the app hot-reloads and the
// sandbox does not, and the symptom is a change that plainly did not take effect.
//
// ONE FUNCTION, TWO CALLERS: `setup-world-assets` at startup, and the dev
// server's watcher while you work. Two copies of an esbuild config would drift,
// and the drift would look exactly like this bug.

import * as esbuild from 'esbuild';
import {join} from 'node:path';

/** Rebuild `public/vendor/world-lab.mjs` from `src/engine`. */
export async function bundleEngine(pkgRoot) {
  await esbuild.build({
    entryPoints: [join(pkgRoot, 'src', 'engine', 'index.ts')],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: join(pkgRoot, 'public', 'vendor', 'world-lab.mjs'),
    logLevel: 'silent',
  });
}

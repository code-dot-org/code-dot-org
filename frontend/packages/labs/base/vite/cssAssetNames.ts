import type {OutputOptions} from 'rollup';

/**
 * Rename emitted CSS-module assets from `*.module.css` to plain `*.css` (and
 * lib-inject-css's injected `import` follows the rename).
 *
 * This package ships CSS-module class names ALREADY HASHED, baked into its
 * built JS as strings. A stylesheet still called `*.module.css` gets the
 * CSS-modules transform re-run by whatever app consumes this `dist`, hashing
 * every selector a second time — so the rules load, and match nothing.
 *
 * The symptom is worth recognising because it does not look like a CSS bug.
 * Everything falls back to its UA default at once: a `<label>` reverts to
 * `display: inline`, a flex row becomes a stack, a container with
 * `height: 100%` collapses to its content. And a package's own dev harness
 * cannot catch it — a harness builds from source, where the hashing happens
 * exactly once, so it looks correct however this is configured.
 *
 * Lives outside `vite.config.ts` so it can be tested: a Vite config cannot be
 * imported into a jsdom test.
 */
export const stripModuleFromCssName: OutputOptions['assetFileNames'] = info => {
  const name = info.names?.[0];
  if (name?.endsWith('.module.css')) {
    return name.replace(/\.module\.css$/, '.css');
  }
  return name ?? 'assets/[name]-[hash][extname]';
};

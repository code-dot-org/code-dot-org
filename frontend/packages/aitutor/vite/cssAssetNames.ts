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
 * `display: inline`, a flex row of buttons becomes a stack, a panel with
 * `height: 100%` collapses to its content. It shipped that way once, and this
 * package's own demo could not catch it — the demo builds from source, where
 * the hashing happens exactly once.
 *
 * Lives outside `src/` because it is build tooling rather than library code,
 * and outside `vite.config.ts` because a Vite config cannot be imported into a
 * jsdom test.
 *
 * `@code-dot-org/lab` solved this first; its copy is the original.
 */
export const stripModuleFromCssName: OutputOptions['assetFileNames'] = info => {
  const name = info.names?.[0];
  if (name?.endsWith('.module.css')) {
    return name.replace(/\.module\.css$/, '.css');
  }
  return name ?? 'assets/[name]-[hash][extname]';
};

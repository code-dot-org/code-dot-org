/* Shared selector rewriting for the brand-scoped copies of the canonical
 * CADS exports (primitiveColors_codeAi.css + colors_codeAi.css).
 *
 * The canonical files are written for a world where CodeAI is the only
 * brand: they define tokens on :root / [data-theme]. Until the legacy
 * token files (primitiveColors.css / colors.css) are retired, the CADS
 * values must not collide with them at :root — several names, e.g.
 * --brand-purple-50 or --neutral-base-black, exist in both with
 * different values. Both generators therefore rewrite the canonical
 * selectors so a copy applies only under one [data-brand] value.
 *
 * Consumers: generateBrandCodeAiNext.mjs (real CADS values),
 * generateBrandCodeAiAudit.mjs (same structure, pink primitives).
 */
import {readFileSync, writeFileSync} from 'node:fs';

/* Primitives: :root -> the element carrying data-brand (html in
 * practice). The :root compound keeps specificity at (0,2,0) so these
 * beat the legacy primitiveColors.css :root declarations (0,1,0)
 * regardless of stylesheet order; the bare attribute selector covers a
 * data-brand attribute on a non-root element.
 * Primitives are theme-invariant, but they must still be re-declared on
 * theme-carrying elements ([data-theme] on a nested div, per Lab2). The
 * legacy shim (brandLegacyShim.css) aliases CADS-only primitive names
 * (e.g. --brand-purple-95) under bare [data-theme='Light'/'Dark']
 * selectors; without matching brand-scoped rules on those same elements,
 * a descendant inside a theme wrapper would inherit the shim's alias
 * (legacy value) instead of the CADS primitive set at <html>. Mirror the
 * semantics' selector set so the brand block outranks the shim (two
 * attribute selectors beat one) at every level under the brand. */
export function rescopePrimitives(css, brand) {
  const out = css.replace(
    /^:root \{$/gm,
    `${brand}:root,\n${brand},\n${brand}[data-theme='Light'],\n${brand} [data-theme='Light'],\n${brand}[data-theme='Dark'],\n${brand} [data-theme='Dark'] {`,
  );
  if (!out.includes(brand)) {
    throw new Error('primitiveColors_codeAi.css: ":root {" selector not found');
  }
  if (out.match(/^:root/m)) {
    throw new Error(
      'primitiveColors_codeAi.css: unscoped ":root" selector left after rewrite',
    );
  }
  return out;
}

/* Semantics: scope both theme blocks. The Light block must keep working
 * when data-theme is absent (:root case) and when a nested element sets
 * data-theme='Light'; same descendant/self pair for Dark, since Lab2 puts
 * data-theme on a nested div while data-brand lives on <html>. */
export function rescopeSemantics(css, brand) {
  const out = css
    .replace(
      /^:root,\n\[data-theme='Light'\] \{$/m,
      `${brand}:root,\n${brand}[data-theme='Light'],\n${brand} [data-theme='Light'] {`,
    )
    .replace(
      /^\[data-theme='Dark'\] \{$/m,
      `${brand}[data-theme='Dark'],\n${brand} [data-theme='Dark'] {`,
    );
  if (out.match(/^:root|^\[data-theme/m)) {
    throw new Error('colors_codeAi.css: unscoped selector left after rewrite');
  }
  return out;
}

/* Shared --check / --write driver. With --check (run by `yarn test` in
 * this package) the generator asserts the committed file matches a fresh
 * run, which catches a canonical CADS re-export that landed without
 * re-running the generator. */
export function emit({outPath, output, name, script}) {
  if (process.argv.includes('--check')) {
    const committed = readFileSync(outPath, 'utf8');
    if (committed !== output) {
      console.error(
        `${name} is stale: it does not match a fresh run of this ` +
          `generator. Run \`node scripts/${script}\` and commit the result.`,
      );
      process.exit(1);
    }
    console.log(`${name} is up to date`);
  } else {
    writeFileSync(outPath, output);
    console.log(`wrote ${name}`);
  }
}

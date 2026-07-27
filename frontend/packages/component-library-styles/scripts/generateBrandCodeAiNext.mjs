/* Generates brandCodeAiNext.css from the canonical CADS exports
 * (primitiveColors_codeAi.css + colors_codeAi.css).
 *
 * The canonical files are written for a world where CodeAI is the only
 * brand: they define tokens on :root / [data-theme]. Until the Aug 2026
 * cutover they must not collide with the legacy tokens in
 * primitiveColors.css / colors.css (several names, e.g. --brand-purple-50
 * or --neutral-base-black, exist in both with different values). This
 * script rewrites their selectors so the CodeAI values only apply under
 * [data-brand='codeai-next'], mirroring the selector shape previously
 * used by the pink audit block.
 *
 * Run after design re-exports either canonical file:
 *   node scripts/generateBrandCodeAiNext.mjs
 *
 * CI freshness check (fails if the committed file doesn't match a fresh
 * run, e.g. because a canonical file changed without re-running this
 * script):
 *   node scripts/generateBrandCodeAiNext.mjs --check
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = "[data-brand='codeai-next']";

const read = name => readFileSync(join(pkgDir, name), 'utf8');

// Primitives: :root -> the element carrying data-brand (html in
// practice). The :root compound keeps specificity at (0,2,0) so these
// beat the legacy primitiveColors.css :root declarations (0,1,0)
// regardless of stylesheet order; the bare attribute selector covers a
// data-brand attribute on a non-root element.
// Primitives are theme-invariant, but they must still be re-declared on
// theme-carrying elements ([data-theme] on a nested div, per Lab2). The
// legacy shim (brandLegacyShim.css) aliases CADS-only primitive names
// (e.g. --brand-purple-95) under bare [data-theme='Light'/'Dark']
// selectors; without matching brand-scoped rules on those same elements,
// a descendant inside a theme wrapper would inherit the shim's alias
// (legacy value) instead of the CADS primitive set at <html>. Mirror the
// semantics' selector set so the brand block outranks the shim (two
// attribute selectors beat one) at every level under the brand.
const primitives = read('primitiveColors_codeAi.css').replace(
  /^:root \{$/gm,
  `${BRAND}:root,\n${BRAND},\n${BRAND}[data-theme='Light'],\n${BRAND} [data-theme='Light'],\n${BRAND}[data-theme='Dark'],\n${BRAND} [data-theme='Dark'] {`,
);
if (!primitives.includes(BRAND)) {
  throw new Error('primitiveColors_codeAi.css: ":root {" selector not found');
}
if (primitives.match(/^:root/m)) {
  throw new Error(
    'primitiveColors_codeAi.css: unscoped ":root" selector left after rewrite',
  );
}

// Semantics: scope both theme blocks. The Light block must keep working
// when data-theme is absent (:root case) and when a nested element sets
// data-theme='Light'; same descendant/self pair for Dark, since Lab2 puts
// data-theme on a nested div while data-brand lives on <html>.
const semantics = read('colors_codeAi.css')
  .replace(
    /^:root,\n\[data-theme='Light'\] \{$/m,
    `${BRAND}:root,\n${BRAND}[data-theme='Light'],\n${BRAND} [data-theme='Light'] {`,
  )
  .replace(
    /^\[data-theme='Dark'\] \{$/m,
    `${BRAND}[data-theme='Dark'],\n${BRAND} [data-theme='Dark'] {`,
  );
if (semantics.match(/^:root|^\[data-theme/m)) {
  throw new Error('colors_codeAi.css: unscoped selector left after rewrite');
}

const header = `/* GENERATED FILE — do not edit.
 * Source: primitiveColors_codeAi.css + colors_codeAi.css (canonical CADS
 * exports), rescoped under ${BRAND} by
 * scripts/generateBrandCodeAiNext.mjs. Re-run that script after design
 * re-exports either source file.
 *
 * At brand cutover this file is deleted and the canonical files take over
 * at :root (see colors.css / primitiveColors.css retirement plan).
 */

`;

const output = header + primitives + '\n' + semantics;
const outPath = join(pkgDir, 'brandCodeAiNext.css');

if (process.argv.includes('--check')) {
  const committed = readFileSync(outPath, 'utf8');
  if (committed !== output) {
    console.error(
      'brandCodeAiNext.css is stale: it does not match a fresh run of ' +
        'this generator. Run `node scripts/generateBrandCodeAiNext.mjs` ' +
        'and commit the result.',
    );
    process.exit(1);
  }
  console.log('brandCodeAiNext.css is up to date');
} else {
  writeFileSync(outPath, output);
  console.log('wrote brandCodeAiNext.css');
}

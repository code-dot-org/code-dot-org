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
const primitives = read('primitiveColors_codeAi.css').replace(
  /^:root \{$/m,
  `${BRAND}:root,\n${BRAND} {`,
);
if (!primitives.includes(BRAND)) {
  throw new Error('primitiveColors_codeAi.css: ":root {" selector not found');
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

writeFileSync(
  join(pkgDir, 'brandCodeAiNext.css'),
  header + primitives + '\n' + semantics,
);
console.log('wrote brandCodeAiNext.css');

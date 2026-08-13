/* Generates brandCodeAiNext.css from the canonical CADS exports
 * (primitiveColors_codeAi.css + colors_codeAi.css), rescoped under
 * [data-brand='codeai-next'] — see scripts/rescopeCads.mjs for why the
 * selectors have to be rewritten at all.
 *
 * Run after design re-exports either canonical file:
 *   node scripts/generateBrandCodeAiNext.mjs
 *
 * CI freshness check (fails if the committed file doesn't match a fresh
 * run, e.g. because a canonical file changed without re-running this
 * script):
 *   node scripts/generateBrandCodeAiNext.mjs --check
 */
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {emit, rescopePrimitives, rescopeSemantics} from './rescopeCads.mjs';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = "[data-brand='codeai-next']";

const read = name => readFileSync(join(pkgDir, name), 'utf8');

const primitives = rescopePrimitives(read('primitiveColors_codeAi.css'), BRAND);
const semantics = rescopeSemantics(read('colors_codeAi.css'), BRAND);

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

emit({
  outPath: join(pkgDir, 'brandCodeAiNext.css'),
  output: header + primitives + '\n' + semantics,
  name: 'brandCodeAiNext.css',
  script: 'generateBrandCodeAiNext.mjs',
});

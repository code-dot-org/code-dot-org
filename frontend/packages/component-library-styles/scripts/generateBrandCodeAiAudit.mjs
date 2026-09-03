/* Generates brandCodeAiAudit.css: the pink audit brand, built as a
 * palette swap of the canonical CADS exports.
 *
 * The audit brand answers one question — "does this pixel get its color
 * from a design-system token?" Every CADS primitive is replaced with a
 * pink of the same ramp position, so anything that resolves through the
 * token system renders pink and anything with a hard-coded color keeps
 * its real color and stands out.
 *
 * Structure is the CADS structure, unmodified: the semantic layer is
 * colors_codeAi.css rescoped to [data-brand='codeai-audit'], with its
 * var(--primitive) chains intact. Only the primitive values differ from
 * brandCodeAiNext.css. Consequences worth knowing:
 *
 *   - The audit file names no legacy tokens. Legacy names go pink via
 *     brandLegacyAliases.css, which maps them onto their CADS successors
 *     under both codeai-next and codeai-audit. When call sites finish
 *     migrating to CADS names and that alias file is deleted along with
 *     colors.css / primitiveColors.css, the audit brand keeps working
 *     untouched.
 *   - A token added by a CADS re-export is pink automatically. An
 *     unrecognized primitive family or ramp step is a hard error here
 *     rather than a token that silently stays non-pink.
 *
 * Run after design re-exports either canonical file:
 *   node scripts/generateBrandCodeAiAudit.mjs
 *
 * CI freshness check:
 *   node scripts/generateBrandCodeAiAudit.mjs --check
 */
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {emit, rescopePrimitives, rescopeSemantics} from './rescopeCads.mjs';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = "[data-brand='codeai-audit']";

const read = name => readFileSync(join(pkgDir, name), 'utf8');

/* Two pink ramps, both running light (step 5) to dark (step 95), so the
 * semantic layer's contrast relationships survive the swap: a token that
 * picks a high step for dark-mode text still lands on a dark pink.
 *
 * ACCENT covers every chromatic family (brand-purple, brand-orange,
 * brand-pink and all four sentiments). They share one ramp on purpose:
 * distinguishing error-pink from success-pink is not the point, and one
 * ramp keeps hot pink #ff69b4 at every family's level 50 — the value the
 * audit brand has always been recognized by.
 *
 * NEUTRAL is a separate, more saturated ramp for neutral-gray. Neutrals
 * carry page surfaces and body text, so its steps are spaced to keep
 * surface layers distinguishable and text legible; a wash-toned neutral
 * ramp would make the audit unreadable in dark mode. */
const ACCENT = {
  5: '#fff0f7',
  10: '#ffe0ef',
  20: '#ffd6ec',
  30: '#ffb3dc',
  40: '#ff8fc9',
  50: '#ff69b4',
  60: '#e8488f',
  70: '#cc2b7a',
  80: '#b02e6c',
  90: '#99255d',
  95: '#8f2058',
};

const NEUTRAL = {
  5: '#fff0f7',
  10: '#ffe0ef',
  20: '#ffd6ec',
  30: '#ffb3dc',
  40: '#ff69b4',
  50: '#e8488f',
  60: '#cc2b7a',
  70: '#b02e6c',
  80: '#99255d',
  90: '#8f2058',
  95: '#6e1543',
};

/* Bases. base-black doubles as light-mode body text and dark-mode page
 * surface, so it is a deep magenta rather than a near-black: readable as
 * text at 11:1 on the pink white, still clearly pink at a glance. */
const BASES = {
  '--neutral-base-white': '#fff8fc',
  '--neutral-base-black': '#5c0f38',
  '--neutral-base-true-black': '#3d0823',
};

/* Overlay alphas. Light mode uses the black-alpha family and dark mode
 * the white-alpha family; both become hot pink at the same opacity so
 * scrims read as pink in either theme. */
const ALPHA = {
  5: '0d',
  10: '1a',
  20: '33',
  30: '4d',
  40: '66',
  50: '80',
  60: '99',
  70: 'b2',
  80: 'cc',
  90: 'e5',
  95: 'f2',
};
const ALPHA_BASE = '#ff69b4';

const ACCENT_FAMILIES = [
  '--brand-purple',
  '--brand-orange',
  '--brand-pink',
  '--sentiment-error',
  '--sentiment-warning',
  '--sentiment-success',
  '--sentiment-information',
];

function pinkValue(token) {
  if (token in BASES) {
    return BASES[token];
  }
  const match = token.match(/^(.*)-(\d+)$/);
  if (match) {
    const [, family, step] = match;
    if (/^--neutral-(black|white)-alpha$/.test(family) && step in ALPHA) {
      return ALPHA_BASE + ALPHA[step];
    }
    if (family === '--neutral-gray' && step in NEUTRAL) {
      return NEUTRAL[step];
    }
    if (ACCENT_FAMILIES.includes(family) && step in ACCENT) {
      return ACCENT[step];
    }
  }
  throw new Error(
    `primitiveColors_codeAi.css: no pink mapping for ${token}. Add the ` +
      'family or ramp step to scripts/generateBrandCodeAiAudit.mjs.',
  );
}

/* Rewrite values in place: keeping the canonical file's declaration
 * order and comments makes a diff against brandCodeAiNext.css a
 * value-only diff.
 *
 * The value half of the pattern is deliberately syntax-agnostic. Every
 * CADS primitive is a hex literal today, but matching only hex would
 * mean a re-export that moved a primitive to rgb() or oklch() left that
 * row unrewritten and still showing its real color — the one failure
 * this brand must not have, and a silent one. */
const primitives = rescopePrimitives(
  read('primitiveColors_codeAi.css'),
  BRAND,
).replace(
  /^([^\S\n]*)(--[a-z0-9-]+):[^;{}]*;[^\S\n]*$/gim,
  (_line, indent, token) => `${indent}${token}: ${pinkValue(token)};`,
);

/* Post-condition. pinkValue() throws for a token name it does not know,
 * but only for rows the pattern above matched; a declaration written in
 * some shape the pattern misses entirely (a trailing comment, say) would
 * pass through untouched. Check the result instead of trusting the
 * pattern: every value left in the primitive block must be one this
 * script put there. */
const PINK = new Set(
  [
    ...Object.values(ACCENT),
    ...Object.values(NEUTRAL),
    ...Object.values(BASES),
    ...Object.values(ALPHA).map(a => ALPHA_BASE + a),
  ].map(v => v.toLowerCase()),
);
for (const [, token, value] of primitives.matchAll(
  /^[^\S\n]*(--[a-z0-9-]+):[^\S\n]*([^;]+);/gm,
)) {
  if (!PINK.has(value.trim().toLowerCase())) {
    throw new Error(
      `primitiveColors_codeAi.css: ${token} kept a non-pink value ` +
        `(${value.trim()}). Its declaration did not match the value ` +
        'rewrite pattern in scripts/generateBrandCodeAiAudit.mjs — widen ' +
        'the pattern to cover it.',
    );
  }
}

const semantics = rescopeSemantics(read('colors_codeAi.css'), BRAND);

const header = `/* GENERATED FILE — do not edit.
 * Source: primitiveColors_codeAi.css + colors_codeAi.css (canonical CADS
 * exports), rescoped under ${BRAND} with every
 * primitive replaced by a pink of the same ramp position, by
 * scripts/generateBrandCodeAiAudit.mjs. Re-run that script after design
 * re-exports either source file.
 *
 * This is the DSCO-coverage audit tool, reached with ?brand=codeai-audit
 * (see Cdo::Brand). Everything that resolves through the token system
 * renders pink; anything left with a hard-coded color does not, and is a
 * bug to file. Comments below are the canonical files' own and describe
 * the real CADS palette, not these values.
 */

`;

emit({
  outPath: join(pkgDir, 'brandCodeAiAudit.css'),
  output: header + primitives + '\n' + semantics,
  name: 'brandCodeAiAudit.css',
  script: 'generateBrandCodeAiAudit.mjs',
});

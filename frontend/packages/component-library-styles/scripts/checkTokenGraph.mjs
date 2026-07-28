/* Checks that every color token actually resolves to a color.
 *
 * The brand layer defines the same token names several times over: the
 * legacy files define them, brandLegacyShim.css defines the CodeAI names
 * from the legacy ones, brandCodeAiNext.css defines the CodeAI names
 * outright for its brand, and brandCodeAiNextAliases.css defines the
 * legacy names back from the CodeAI ones. Which declaration wins depends
 * on the element a token is read on, so a token can be correct on <html>
 * and wrong — or blank — inside a themed section of the page (Lab2 and
 * Storybook both nest one).
 *
 * Two ways that has broken in practice, both invisible in review:
 *
 *   - A token comes out blank. If two files define a pair of names from
 *     each other and both land on the same element, with no plain value
 *     to settle it, CSS calls the definition circular and turns both
 *     names off. Everything downstream of them goes transparent.
 *   - A token comes out stale. Primitives hold one value in every theme,
 *     so a file that defines them for themed elements while another
 *     defines them only at the top level leaves themed sections reading
 *     the other file's value.
 *
 * This script resolves every token the way a browser would, on a set of
 * representative elements, and fails on either symptom:
 *
 *   1. no token resolves to nothing, anywhere;
 *   2. primitives resolve to the same value everywhere, since they do not
 *      vary by theme.
 *
 * It asserts outcomes, not selector style, so it stays valid however the
 * files are organised.
 *
 *   node scripts/checkTokenGraph.mjs
 */
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(join(pkgDir, name), 'utf8');

/* Cascade order as consumers import it: the legacy tokens, then the brand
 * layer. brandOverrides.css is the authority on the brand layer's order,
 * so read its @import list rather than repeating it here. */
const BRAND_LAYER = [
  ...read('brandOverrides.css').matchAll(/@import\s+'\.\/([^']+)'/g),
].map(m => m[1]);
const FILES = ['primitiveColors.css', 'colors.css', ...BRAND_LAYER];

/* Primitives are whatever the primitive files declare. Reading the names
 * from them keeps this in step with re-exports; primitiveColors_codeAi.css
 * is not shipped (brandCodeAiNext.css carries its values) but is still the
 * authority on which CADS names are primitives. */
const primitiveNames = new Set(
  ['primitiveColors.css', 'primitiveColors_codeAi.css']
    .flatMap(f => [...read(f).matchAll(/^\s*(--[\w-]+)\s*:/gm)])
    .map(m => m[1]),
);

// ---------------------------------------------------------------- parsing

const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '');

function parseRules() {
  const rules = [];
  for (const file of FILES) {
    for (const m of stripComments(read(file)).matchAll(
      /([^{}]+)\{([^{}]*)\}/g,
    )) {
      const selectors = m[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .filter(s => !s.startsWith('@'));
      const decls = [];
      for (const d of m[2].split(';')) {
        const i = d.indexOf(':');
        if (i < 0) continue;
        const prop = d.slice(0, i).trim();
        if (prop.startsWith('--')) decls.push([prop, d.slice(i + 1).trim()]);
      }
      if (selectors.length && decls.length)
        rules.push({file, selectors: selectors.map(parseSelector), decls});
    }
  }
  return rules;
}

/* Selectors here are compound selectors joined by descendant combinators:
 * tag names, [attr='value'], and :root. That covers the whole brand layer;
 * anything richer would need more here. */
function parseSelector(text) {
  const compounds = text
    .split(/\s+/)
    .filter(Boolean)
    .map(part => {
      const attrs = [
        ...part.matchAll(/\[([\w-]+)=['"]?([^'"\]]+)['"]?\]/g),
      ].map(a => [a[1], a[2]]);
      const root = part.includes(':root');
      const tag = (part.match(/^[a-zA-Z][\w-]*/) || [])[0];
      return {attrs, root, tag};
    });
  // Specificity: attributes and pseudo-classes in the b column, tags in c.
  const b = compounds.reduce(
    (n, c) => n + c.attrs.length + (c.root ? 1 : 0),
    0,
  );
  const c = compounds.reduce((n, k) => n + (k.tag ? 1 : 0), 0);
  return {text, compounds, spec: b * 1000 + c};
}

const compoundMatches = (compound, el) =>
  (!compound.tag || compound.tag === el.tag) &&
  (!compound.root || el.root) &&
  compound.attrs.every(([k, v]) => el.attrs[k] === v);

/* Match right-to-left: the last compound must match the element itself,
 * earlier ones must match ancestors, in order. */
function selectorMatches(sel, chain) {
  const target = chain[chain.length - 1];
  const last = sel.compounds[sel.compounds.length - 1];
  if (!compoundMatches(last, target)) return false;
  let ancestors = chain.slice(0, -1);
  for (let i = sel.compounds.length - 2; i >= 0; i--) {
    const at = ancestors.findLastIndex(el =>
      compoundMatches(sel.compounds[i], el),
    );
    if (at < 0) return false;
    ancestors = ancestors.slice(0, at);
  }
  return true;
}

// -------------------------------------------------------------- resolving

/* Winning declaration per property on one element: highest specificity,
 * then latest in source order. */
function cascade(rules, chain) {
  const win = new Map();
  rules.forEach((rule, order) => {
    for (const sel of rule.selectors) {
      if (!selectorMatches(sel, chain)) continue;
      for (const [prop, value] of rule.decls) {
        const cur = win.get(prop);
        if (
          !cur ||
          sel.spec > cur.spec ||
          (sel.spec === cur.spec && order >= cur.order)
        )
          win.set(prop, {value, spec: sel.spec, order, file: rule.file});
      }
    }
  });
  return win;
}

/* Split the inside of a var() into its name and optional fallback. */
function splitVar(body) {
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '(') depth++;
    else if (body[i] === ')') depth--;
    else if (body[i] === ',' && depth === 0)
      return [body.slice(0, i).trim(), body.slice(i + 1).trim()];
  }
  return [body.trim(), null];
}

/* Substitute var() references in a value. Names declared on this element
 * resolve through it; anything else takes the value inherited from the
 * parent, which is how a themed section can read a different value than
 * <html>. Returns null when the value cannot resolve. */
function resolveElement(win, inherited) {
  const values = new Map();
  const blank = new Map(); // prop -> reason
  const state = new Map();

  function resolve(prop, stack) {
    if (state.get(prop) === 'done')
      return blank.has(prop) ? null : values.get(prop);
    if (state.get(prop) === 'busy') {
      const members = stack.slice(stack.indexOf(prop));
      const cycle = members.join(' -> ') + ' -> ' + prop;
      members.forEach(p => blank.set(p, `circular definition: ${cycle}`));
      return null;
    }
    if (!win.has(prop)) return inherited.get(prop) ?? null;

    state.set(prop, 'busy');
    stack.push(prop);
    let value = win.get(prop).value;
    let reason = null;
    for (;;) {
      const start = value.indexOf('var(');
      if (start < 0) break;
      let depth = 0,
        end = -1;
      for (let i = start + 3; i < value.length; i++) {
        if (value[i] === '(') depth++;
        else if (value[i] === ')' && --depth === 0) {
          end = i;
          break;
        }
      }
      if (end < 0) {
        reason = `unterminated var() in "${value}"`;
        break;
      }
      const [name, fallback] = splitVar(value.slice(start + 4, end));
      const sub = resolve(name, stack) ?? fallback;
      if (sub == null) {
        reason = blank.get(name)
          ? `depends on ${name} (${blank.get(name)})`
          : `${name} is never defined`;
        break;
      }
      value = value.slice(0, start) + sub + value.slice(end + 1);
    }
    stack.pop();
    state.set(prop, 'done');
    if (reason) {
      if (!blank.has(prop)) blank.set(prop, reason);
      return null;
    }
    values.set(prop, value.trim());
    return value.trim();
  }

  for (const prop of win.keys()) resolve(prop, []);
  // Inherited names the element does not redefine keep their value.
  for (const [prop, value] of inherited)
    if (!win.has(prop) && !values.has(prop)) values.set(prop, value);
  return {values, blank};
}

/* Resolve a whole ancestor chain, top down, so each element inherits real
 * values from its parent. Returns the deepest element's result. */
function resolveChain(rules, chain) {
  let result = {values: new Map(), blank: new Map()};
  let inherited = new Map();
  for (let i = 0; i < chain.length; i++) {
    result = resolveElement(cascade(rules, chain.slice(0, i + 1)), inherited);
    inherited = result.values;
  }
  return result;
}

// --------------------------------------------------------------- contexts

const html = brand => ({
  tag: 'html',
  root: true,
  attrs: brand ? {'data-brand': brand} : {},
});
const themed = theme => ({
  tag: 'div',
  root: false,
  attrs: {'data-theme': theme},
});

/* One entry per element a token realistically gets read on: the document
 * root, the root carrying a theme, a themed section nested inside the page
 * (Lab2, Storybook), and a themed section nested in another. */
function contextsFor(brand) {
  const root = html(brand);
  const rootThemed = theme => ({
    ...root,
    attrs: {...root.attrs, 'data-theme': theme},
  });
  return [
    ['<html>', [root]],
    ["<html data-theme='Light'>", [rootThemed('Light')]],
    ["<html data-theme='Dark'>", [rootThemed('Dark')]],
    ["nested [data-theme='Light']", [root, themed('Light')]],
    ["nested [data-theme='Dark']", [root, themed('Dark')]],
    [
      "[data-theme='Dark'] inside [data-theme='Light']",
      [root, themed('Light'), themed('Dark')],
    ],
    [
      "[data-theme='Light'] inside [data-theme='Dark']",
      [root, themed('Dark'), themed('Light')],
    ],
  ];
}

const BRANDS = [
  [null, 'legacy (no data-brand)'],
  ['codeai-next', "[data-brand='codeai-next']"],
  ['codeai-audit', "[data-brand='codeai-audit']"],
];

// ----------------------------------------------------------------- report

const rules = parseRules();
const failures = [];
let checked = 0;

for (const [brand, brandLabel] of BRANDS) {
  const contexts = contextsFor(brand);
  const baseline = resolveChain(rules, contexts[0][1]).values;

  for (const [label, chain] of contexts) {
    const {values, blank} = resolveChain(rules, chain);
    checked += values.size;

    for (const [prop, reason] of [...blank].sort())
      failures.push(
        `${brandLabel} ${label}\n    ${prop} resolves to nothing — ${reason}`,
      );

    // Primitives do not vary by theme, so every element must agree.
    for (const prop of primitiveNames) {
      const here = values.get(prop);
      const there = baseline.get(prop);
      if (here !== undefined && there !== undefined && here !== there)
        failures.push(
          `${brandLabel} ${label}\n    ${prop} is ${here} here but ${there} on <html>` +
            ` — primitives must not vary by theme`,
        );
    }
  }
}

if (failures.length) {
  console.error(`checkTokenGraph: ${failures.length} problem(s)\n`);
  for (const f of failures) console.error('  ' + f + '\n');
  console.error(
    'Each token above is read from an element where the wrong file wins, or\n' +
      'where two files define a pair of names from each other. Check which\n' +
      'selectors reach that element in the files listed in brandOverrides.css.',
  );
  process.exit(1);
}

console.log(
  `checkTokenGraph: ok — ${checked} token resolutions across ` +
    `${BRANDS.length} brands x ${contextsFor(null).length} element contexts`,
);

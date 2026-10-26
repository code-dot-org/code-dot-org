// A rule nobody has typed into is the library's rule.
//
// specs/NEXT.md §2. A project carries its own copy of every rule it uses,
// which is the right OWNERSHIP — the rule is the learner's, editable,
// unconnected to the library — and it made a starter project 1.19MB of JSON,
// of which 1.10MB was twelve rules nobody had touched and 500KB was `solid`
// alone. Every save, every diff, every tutor context paid for it.
//
// So a rule arrives as a REFERENCE and becomes a copy the moment it is
// edited. The ownership story is unchanged where it matters: the first block a
// learner moves makes the rule theirs, at which point it is a file like any
// other and nothing here is involved again.
//
// AND THERE IS DELIBERATELY NO GATE IN FRONT OF THAT. §2 originally asked for
// an unedited rule to open read-only until the learner said they meant it,
// which would make a stray drag cost nothing — and would teach that a stock
// rule is somebody else's, which is the opposite of what these being real
// rules is for. A learner opens Gravity, changes something, and it is theirs.
// The saving was an easy win taken on the way past; it is not a reason to ask
// anybody whether they are sure.
//
// WHAT MAKES THIS CHEAP is that there is one place to resolve it. Everything
// downstream of `projectFiles` — the palette, the dropdowns, the generator,
// the compiler, the tutor — reads `path -> contents`, and a reference resolved
// there is invisible to all of it. Nothing else has to learn a second shape
// for what a rule is.
//
// AND ONE PLACE TO MATERIALIZE. The editor saves a workspace by serializing
// the whole of it, so a reference becomes a copy by the ordinary act of being
// edited: the save writes blocks where the reference was. There is no
// promotion step to get wrong, and no state in which a file is half of each.

import {stockRule, type StockRule} from './stock';

/** What a `.rule` file holds when it is still the library's. */
export interface RuleReference {
  /** The stock rule's id — `solid` for `rules/solid.rule`. */
  stock: string;
  /**
   * The shelf this was imported from, as a hash of the rule's contents.
   *
   * RECORDED, AND NOT YET ACTED ON. Being plain about that is the point of
   * this comment. §2 asks for a pinned version so that "the copy that appears
   * on first edit is the shelf as it was, not as it is" — and that is not
   * implementable as stated, because the bundle carries ONE shelf. Restoring
   * an old rule would mean shipping every historical version of all 47, which
   * is the weight this section exists to remove.
   *
   * So a reference always resolves to the current rule, and an unedited rule
   * follows the library. For a rule nobody has touched that is arguably what
   * should happen — a fix to `solid` reaches the projects that never changed
   * it — but it IS a behavior change a learner did not ask for, and this
   * field is what a later migration would key on. It is in the format now
   * because widening a format is cheap and narrowing one is not.
   */
  version: string;
}

/**
 * The first bytes of a reference, which is how one is recognized without
 * parsing.
 *
 * A real rule file is a Blockly serialization and can be half a megabyte;
 * `projectFiles` runs over every file in the project and must not parse them
 * to find out what they are. So the format is pinned to a literal prefix,
 * which is a string comparison against contents we write ourselves.
 */
const PREFIX = '{"stock":';

/** A hash of `text`, for the version pin. FNV-1a, 32-bit, hex. */
function hash(text: string): string {
  let value = 0x811c9dc5;
  for (let at = 0; at < text.length; at++) {
    value ^= text.charCodeAt(at);
    // The FNV prime, by shifts because the multiply overflows a double.
    value +=
      (value << 1) + (value << 4) + (value << 7) + (value << 8) + (value << 24);
  }
  return (value >>> 0).toString(16).padStart(8, '0');
}

/** Hashes are asked for repeatedly and the shelf does not change at runtime. */
const hashes = new Map<string, string>();

/** The version a stock rule is at now. */
export function stockVersion(rule: StockRule): string {
  const known = hashes.get(rule.id);
  if (known !== undefined) {
    return known;
  }
  const made = hash(rule.contents);
  hashes.set(rule.id, made);
  return made;
}

/** What to write into `rules/<id>.rule` when a rule is imported unedited. */
export function ruleReferenceFor(rule: StockRule): string {
  // Key order matters: `PREFIX` is how this is recognized again.
  return JSON.stringify({stock: rule.id, version: stockVersion(rule)});
}

/**
 * What a `.rule` file should hold for `rule` — a reference, or the rule whole.
 *
 * A REFERENCE ONLY IF THE SHELF CAN RESOLVE ONE. `resolveRuleContents` looks a
 * reference up in `STOCK_RULES` and answers the empty string when it is not
 * there, so a rule imported by anything OTHER than the shelf — a fixture
 * placing one that is finished but has no lesson yet, a test standing one up —
 * would land as a file with nothing in it. Nothing downstream notices: an empty
 * workspace parses to no metadata, the generator emits `export {}`, and the
 * world builds with an undefined rule in its list. The failure that reaches a
 * reader is `Cannot read properties of undefined (reading 'id')`, three layers
 * away from the import that caused it.
 *
 * So the saving is taken where it is available and the rule is written whole
 * where it is not. Both are ordinary `.rule` files to everything downstream,
 * which is the property this format exists to keep.
 */
export function ruleFileContents(rule: StockRule): string {
  return stockRule(rule.id) ? ruleReferenceFor(rule) : rule.contents;
}

/** Whether these are the contents of a reference rather than of a workspace. */
export function isRuleReference(contents: string): boolean {
  return contents.startsWith(PREFIX);
}

/** The reference these contents are, or undefined if they are a workspace. */
export function parseRuleReference(
  contents: string,
): RuleReference | undefined {
  if (!isRuleReference(contents)) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(contents) as Partial<RuleReference>;
    return typeof parsed.stock === 'string'
      ? {stock: parsed.stock, version: String(parsed.version ?? '')}
      : undefined;
  } catch {
    // A file that starts like a reference and is not one is not a reference.
    return undefined;
  }
}

/**
 * A rule file's contents with a reference resolved to the rule it names.
 *
 * Identity for a file the learner has edited, which is every file that is not
 * a reference — so this is safe to run over a whole project and costs a
 * `startsWith` per file.
 *
 * A reference to a rule THAT IS NO LONGER ON THE SHELF resolves to nothing,
 * and nothing is what an empty rule file already means everywhere else: the
 * project has a file that declares no rule, the palette offers none of its
 * blocks, and whatever used them draws as an unregistered type. That is the
 * same failure as deleting a rule file by hand, which the lab already
 * survives — and it is better than throwing, which would take the project down
 * over one renamed rule in the library.
 */
export function resolveRuleContents(contents: string): string {
  const reference = parseRuleReference(contents);
  if (!reference) {
    return contents;
  }
  return stockRule(reference.stock)?.contents ?? '';
}

/**
 * The reference a starter project holds for a stock rule, by id.
 *
 * Throws on an id the shelf does not have, which is the right failure for the
 * one caller: a starter project names its rules in source, so a typo or a
 * renamed rule should stop the build rather than ship a project holding a file
 * that resolves to nothing.
 */
export function referenceToStock(id: string): string {
  const rule = stockRule(id);
  if (!rule) {
    throw new Error(`No stock rule "${id}" to reference.`);
  }
  return ruleReferenceFor(rule);
}

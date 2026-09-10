// The shelf, grouped by what part of the map each rule comes from.
//
// `stockRuleTree` nested the library by what each rule is WRITTEN AGAINST, and
// that is a real relation — Camera Ease is a thing you add to a Camera — but it
// is not the one somebody browsing is asking about. They are asking "what kind
// of game am I making", and the answer to that already exists, curated and
// maintained: the progression's regions. Motion, Platformer, Arcade, Puzzle.
//
// DERIVED, LIKE THE TREE WAS. Every stock rule is granted by exactly one lesson
// (`progression/catalogue`), and every lesson sits in one region, so a rule's
// region is read rather than assigned. A rule added tomorrow lands in the right
// group by saying which lesson teaches it — which it already has to say, or a
// gated lab could never unlock it.
//
// TWO RULES ARE NOT OFFERED AT ALL. See `BASE_RULES` below: a base does nothing
// on its own and arrives with whatever needs it, so a tile for one is a tile
// nobody has a reason to press.
//
// THE TREE DOES NOT SURVIVE THE REGROUPING, and nothing is lost. Collection is
// written against Collisions and belongs to Platformer while Collisions belongs
// to Logic, so indentation inside a region would show a child with no parent
// above it. What the nesting said — "this one brings that one with it" — is
// what `Also adds:` says on the chosen tile, in words, where it was already
// being said.

import {GRANTED_BY, TILES} from '../progression';
import {REGIONS} from '../progression/regions';
import type {Region} from '../progression/types';

import {STOCK_RULES, type StockRule} from './stock';
import {stockRuleRows, stockRuleTree} from './stockRuleTree';

/**
 * The rules the shelf does not offer, and why there are any.
 *
 * A BASE is a rule that does nothing on its own because something else stands
 * on it. "Notices Collisions" works out who is touching whom and acts on none
 * of it — Solid Bodies, Collection and Health are what act; "Has a Camera"
 * moves the view to wherever something else aimed it, and aiming is the four
 * rules written against it. Neither has anything to demonstrate, and neither is
 * a thing to reach for: you reach for the one that does the thing you want, and
 * the base arrives with it (`Also adds:` on the chosen tile says so).
 *
 * NOT THE SAME AS THE `foundational` FLAG this library used to carry. That one
 * marked the rules a project ran by merely holding, which is every rule now
 * (`blockly/projectModules`), and it was removed because it marked nothing.
 * This marks the two with nothing to show.
 *
 * Offering them cost more than the room they took. A base has no demo and can
 * have none, so in a grid they were the two blank tiles among forty-three
 * pictures — which reads as a dialog that failed to load rather than as a
 * library with two special cases in it.
 */
export const BASE_RULES: readonly string[] = ['collisions', 'camera'];

/** One heading of the shelf, and what is under it. */
export interface RuleGroup {
  region: Region;
  rules: readonly StockRule[];
}

/** The region a rule comes from, or nothing when no lesson grants it. */
export function regionOfRule(rule: StockRule): Region | undefined {
  const tile = GRANTED_BY.get(`rule:${rule.id}`);
  const region = TILES.find(one => one.id === tile)?.region;
  return REGIONS.find(one => one.id === region);
}

/**
 * The shelf as groups, in the map's own order: Origin, then the foundations,
 * then the genres.
 *
 * Within a group the library's order is kept — `STOCK_RULES` is arranged so the
 * rules a first game needs come first — and `stockRuleRows` is what supplies
 * it, because that keeps a rule's add-ons directly after it. Camera's four
 * still read as Camera's four inside Place; they simply are not indented.
 *
 * A region with no rules in it is left out rather than shown empty: Making
 * teaches the editor rather than the library, and a heading with nothing under
 * it is a promise the shelf cannot keep.
 */
export function stockRuleGroups(
  rules: readonly StockRule[] = STOCK_RULES,
): RuleGroup[] {
  const ordered = stockRuleRows(stockRuleTree(rules))
    .map(row => row.rule)
    // The tree is built from ALL of them, and the bases are dropped after: a
    // base is what several rules are written against, so taking it out first
    // would scatter its children across the top level for no reason anybody
    // reading the shelf could see.
    .filter(rule => !BASE_RULES.includes(rule.id));
  const groups = new Map<string, StockRule[]>();
  const loose: StockRule[] = [];
  for (const rule of ordered) {
    const region = regionOfRule(rule);
    if (!region) {
      loose.push(rule);
      continue;
    }
    groups.set(region.id, [...(groups.get(region.id) ?? []), rule]);
  }
  const out: RuleGroup[] = REGIONS.filter(region => groups.has(region.id)).map(
    region => ({region, rules: groups.get(region.id) as StockRule[]}),
  );
  // A rule no lesson grants would otherwise vanish from the dialog, which is a
  // worse failure than an odd heading: the shelf is what a project is built
  // from, and a rule the library holds has to be reachable.
  if (loose.length > 0) {
    out.push({
      region: {
        id: 'making',
        name: 'Everything else',
        kind: 'making',
        summary: 'Rules no lesson has claimed yet.',
      } as Region,
      rules: loose,
    });
  }
  return out;
}

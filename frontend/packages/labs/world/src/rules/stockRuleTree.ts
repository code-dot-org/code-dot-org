// The shelf as a tree, derived rather than curated.
//
// The library outgrew a flat list: twenty-three rules, each carrying an
// ability, a sentence, what else it drags in and what it gives actors. Grouping
// them by hand would mean a taxonomy somebody maintains and a home for every
// rule added afterwards — and the overlaps are real, since Arrow Keys is input
// AND movement and Health is contact AND game loop.
//
// So the grouping is READ OFF THE RULES. A rule whose only requirement is
// another stock rule is shown UNDER it, because that is what it is: Camera Ease
// is not a peer of Camera, it is a thing you add to one. Nothing is invented,
// nothing is maintained, and a new rule finds its own place by saying what it
// is written against — which it already has to say.
//
// A rule with TWO requirements stays at the top. Gravity is written against
// Physics and Solid Bodies, and filing it under either would be picking one
// arbitrarily and telling a learner something untrue about the other.

import {stockDependencies} from './importStockRule';
import {STOCK_RULES, type StockRule} from './stock';

/** A rule and the rules written against it alone. */
export interface StockRuleNode {
  rule: StockRule;
  children: StockRuleNode[];
}

/**
 * The shelf, nested by sole requirement, keeping the library's own order.
 *
 * Order is the list's, not alphabetical: `STOCK_RULES` is arranged so the rules
 * a first game needs come first, and a tree that resorted them would throw that
 * away for a property nobody was looking for.
 */
export function stockRuleTree(
  rules: readonly StockRule[] = STOCK_RULES,
): StockRuleNode[] {
  const known = new Set(rules.map(rule => rule.id));
  // The one rule this rests on: a SOLE requirement, and one that is on the
  // shelf. `stockDependencies` already resolves a rule's `use rule` names to
  // the stock entries they mean.
  const parentOf = new Map<string, string>();
  for (const rule of rules) {
    const deps = stockDependencies(rule);
    if (deps.length === 1 && known.has(deps[0].id) && deps[0].id !== rule.id) {
      parentOf.set(rule.id, deps[0].id);
    }
  }

  const nodes = new Map<string, StockRuleNode>(
    rules.map(rule => [rule.id, {rule, children: []}]),
  );
  const roots: StockRuleNode[] = [];
  for (const rule of rules) {
    const parent = parentOf.get(rule.id);
    const under = parent === undefined ? undefined : nodes.get(parent);
    // A cycle would hang the walk and cannot happen — a rule cannot require
    // something that requires it — but a shelf is data, and data can be wrong.
    if (under && !descendsFrom(under, rule.id, parentOf)) {
      under.children.push(nodes.get(rule.id) as StockRuleNode);
    } else {
      roots.push(nodes.get(rule.id) as StockRuleNode);
    }
  }
  return roots;
}

/** Whether `node` already sits under `id`, following the parent links. */
function descendsFrom(
  node: StockRuleNode,
  id: string,
  parentOf: Map<string, string>,
): boolean {
  let at: string | undefined = node.rule.id;
  const seen = new Set<string>();
  while (at !== undefined && !seen.has(at)) {
    if (at === id) {
      return true;
    }
    seen.add(at);
    at = parentOf.get(at);
  }
  return false;
}

/** The tree flattened back to rows, each with how deep it sits. */
export function stockRuleRows(
  nodes: StockRuleNode[] = stockRuleTree(),
  depth = 0,
): Array<{rule: StockRule; depth: number}> {
  return nodes.flatMap(node => [
    {rule: node.rule, depth},
    ...stockRuleRows(node.children, depth + 1),
  ]);
}

// A rule's CODE, as the hot-reload reconciler sees it.
//
// `ruleIds` says which rules a world has, which catches `use rule` being added
// or removed. It does not catch the rule being EDITED — same rule, new step —
// and that matters for the same reason a handler's body does: a patch keeps the
// running world, and the running world holds the Rule objects the previous
// build gave it. Its steps are the functions that were compiled then. So an
// edit to a `.rule` that lands in a rebuild with anything patchable in it would
// leave the old step running under a banner saying the change was applied live.
//
// Nothing about a rule's code is patchable — the scheduler resolved a step
// order from these objects and the actors' traits came out of them — so this
// hash exists to force a restart, not to enable a patch.

import {fnv1a} from './hash';
import type {Rule, StepOrder} from './types';

/**
 * A step's placement, as one line: the kind, and WHICH step it anchors to.
 *
 * Spelled out rather than stringified whole, because an anchor is the anchor
 * STEP — serializing it would drag in that step's own anchor, and its anchor's,
 * for a chain whose length is a detail of somebody else's rule file. The
 * anchor's identity is the part that matters here.
 */
const placement = (order: StepOrder): string =>
  order.kind === 'before' || order.kind === 'after'
    ? `${order.kind} ${order.anchor.ownerId}.${order.anchor.id}`
    : order.kind;

/**
 * Every function a rule carries, in a stable order: its steps, its own actions
 * and queries, and those of each trait it defines.
 *
 * Sorted by id at each level so two builds of an unchanged file produce the
 * same text. Ids and step order ride along with the sources because they are
 * part of what the code DOES — renaming a step or moving it before another one
 * changes the world's behaviour as surely as editing its body.
 *
 * Property DEFAULTS are deliberately absent. They reach the snapshot as values,
 * in `world` and `actors`, where a change to one patches into the running game
 * — which is the good behaviour, and folding them in here would replace it with
 * a restart.
 */
function codeOf(rule: Rule): string {
  const parts: string[] = [];
  const each = <T>(
    record: Readonly<Record<string, T>>,
    write: (item: T) => void,
  ) =>
    Object.keys(record)
      .sort()
      .forEach(key => write(record[key]));

  each(rule.steps, step =>
    parts.push(`step ${step.id} ${placement(step.order)} ${step.run}`),
  );
  each(rule.actions, action =>
    parts.push(`action ${action.id} ${action.apply}`),
  );
  each(rule.queries, query =>
    parts.push(`query ${query.id} ${query.evaluate}`),
  );
  each(rule.traits, trait => {
    each(trait.actions, action =>
      parts.push(`${trait.id} action ${action.id} ${action.apply}`),
    );
    each(trait.queries, query =>
      parts.push(`${trait.id} query ${query.id} ${query.evaluate}`),
    );
  });
  return parts.join('\n');
}

/**
 * A rule's code, hashed — the counterpart to `effectContentHash`, and read the
 * opposite way: an effect's content can be swapped under a running filter, a
 * rule's cannot be swapped under a running world.
 *
 * Its limit is `Function.prototype.toString`'s: a value a step closes over
 * rather than inlines does not appear in its source.
 */
export function ruleContentHash(rule: Rule): string {
  return fnv1a(codeOf(rule));
}

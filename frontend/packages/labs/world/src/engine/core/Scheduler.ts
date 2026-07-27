// Orders the Steps a World's active Rules contribute into a single per-tick
// sequence, honoring each Step's `before`/`after`/`first`/`last` constraint
// (DESIGN.md: "It does it as a 'Before Motion do:' block"). The order is
// computed once at construction (a topological sort) and reused every tick; a
// cycle is a construction-time error, never a silent misorder at tick time.

import type {Step, StepFn} from './types';
import type {World} from './World';

export class Scheduler {
  private readonly ordered: readonly Step[];

  constructor(steps: readonly Step[]) {
    this.ordered = topologicalOrder(steps);
  }

  /** Steps in resolved order — for inspection and tests. */
  order(): readonly Step[] {
    return this.ordered;
  }

  /** Run every step in order, once, for this tick. */
  run(world: World, delta: number): void {
    for (const step of this.ordered) {
      const run: StepFn = step.run;
      run(world, delta);
    }
  }
}

/**
 * Kahn's algorithm over the precedence edges the Step orders imply. Ties break
 * by original insertion index, so an unconstrained set keeps author order.
 */
function topologicalOrder(steps: readonly Step[]): Step[] {
  const index = new Map<Step, number>();
  steps.forEach((step, i) => index.set(step, i));

  // edges[a] = set of steps that must come AFTER a.
  const after = new Map<Step, Set<Step>>();
  const indegree = new Map<Step, number>();
  for (const step of steps) {
    after.set(step, new Set());
    indegree.set(step, 0);
  }

  const addEdge = (from: Step, to: Step) => {
    if (from === to) {
      return;
    }
    const set = after.get(from);
    if (set && !set.has(to)) {
      set.add(to);
      indegree.set(to, (indegree.get(to) ?? 0) + 1);
    }
  };

  const firsts = steps.filter(s => s.order.kind === 'first');
  const lasts = steps.filter(s => s.order.kind === 'last');

  for (const step of steps) {
    const {order} = step;
    if (order.kind === 'before') {
      requireAnchor(step, order.anchor, index);
      addEdge(step, order.anchor);
    } else if (order.kind === 'after') {
      requireAnchor(step, order.anchor, index);
      addEdge(order.anchor, step);
    }
  }
  // `first` steps precede everything that is not itself `first`; `last` steps
  // follow everything that is not itself `last`.
  for (const f of firsts) {
    for (const s of steps) {
      if (s.order.kind !== 'first') {
        addEdge(f, s);
      }
    }
  }
  for (const l of lasts) {
    for (const s of steps) {
      if (s.order.kind !== 'last') {
        addEdge(s, l);
      }
    }
  }

  // Ready = indegree 0, drained smallest-original-index first for stability.
  const ready = steps
    .filter(s => (indegree.get(s) ?? 0) === 0)
    .sort((a, b) => (index.get(a) ?? 0) - (index.get(b) ?? 0));
  const result: Step[] = [];
  while (ready.length > 0) {
    const step = ready.shift() as Step;
    result.push(step);
    const dependents = [...(after.get(step) ?? [])].sort(
      (a, b) => (index.get(a) ?? 0) - (index.get(b) ?? 0),
    );
    for (const next of dependents) {
      const d = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, d);
      if (d === 0) {
        // Insert keeping the ready list sorted by original index.
        const at = ready.findIndex(
          r => (index.get(r) ?? 0) > (index.get(next) ?? 0),
        );
        if (at === -1) {
          ready.push(next);
        } else {
          ready.splice(at, 0, next);
        }
      }
    }
  }

  if (result.length !== steps.length) {
    const cyclic = steps
      .filter(s => !result.includes(s))
      .map(s => `${s.ownerId}.${s.id}`)
      .join(', ');
    throw new Error(`Step ordering has a cycle among: ${cyclic}`);
  }
  return result;
}

function requireAnchor(
  step: Step,
  anchor: Step,
  index: Map<Step, number>,
): void {
  if (!index.has(anchor)) {
    throw new Error(
      `Step '${step.ownerId}.${step.id}' is ordered relative to ` +
        `'${anchor.ownerId}.${anchor.id}', which is not active in this world ` +
        `(is its rule required?)`,
    );
  }
}

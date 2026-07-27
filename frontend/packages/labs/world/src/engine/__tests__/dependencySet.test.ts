import {describe, expect, it} from 'vitest';

import {DependencySet} from '../core/traits';

// Reference-counted dependency resolution (DESIGN.md). Synthetic nodes make the
// counting behavior explicit; the standard-rule variant is in engine.test.ts.
interface Node {
  id: string;
  deps: Node[];
}

const makeSet = () =>
  new DependencySet<Node>(
    n => n.deps,
    n => n.id,
  );

describe('DependencySet', () => {
  it('pulls in dependencies as implied when an item is added', () => {
    const a: Node = {id: 'a', deps: []};
    const b: Node = {id: 'b', deps: [a]};
    const ds = makeSet();
    ds.add(b);
    expect(ds.has(b)).toBe(true);
    expect(ds.has(a)).toBe(true);
    expect(ds.count(a)).toBe(1);
  });

  it('reference-counts a dependency shared by two dependents', () => {
    const a: Node = {id: 'a', deps: []};
    const b: Node = {id: 'b', deps: [a]};
    const c: Node = {id: 'c', deps: [a]};
    const ds = makeSet();
    ds.add(b);
    ds.add(c);
    expect(ds.count(a)).toBe(2);

    // Removing one dependent leaves the shared dependency, held by the other.
    ds.remove(b);
    expect(ds.has(b)).toBe(false);
    expect(ds.has(a)).toBe(true);
    expect(ds.count(a)).toBe(1);

    // Removing the last dependent drops the now-orphaned dependency.
    ds.remove(c);
    expect(ds.has(c)).toBe(false);
    expect(ds.has(a)).toBe(false);
  });

  it('keeps an explicitly-added item that a removed dependent also required', () => {
    const a: Node = {id: 'a', deps: []};
    const b: Node = {id: 'b', deps: [a]};
    const ds = makeSet();
    ds.add(a); // explicit
    ds.add(b); // implies a → a total 2 (1 explicit + 1 implied)
    expect(ds.count(a)).toBe(2);

    ds.remove(b); // implied a decremented; the explicit add survives
    expect(ds.has(a)).toBe(true);
    expect(ds.count(a)).toBe(1);

    ds.remove(a); // now fully removed
    expect(ds.has(a)).toBe(false);
  });

  it('lists present items in insertion order', () => {
    const a: Node = {id: 'a', deps: []};
    const b: Node = {id: 'b', deps: [a]};
    const ds = makeSet();
    ds.add(b);
    expect(ds.items().map(n => n.id)).toEqual(['b', 'a']);
  });
});

// `⟨list⟩ has ⟨x⟩`, and the index behind it.
//
// The answer has not changed; what changed is that asking a long list stopped
// being a walk of it. A flood fill asks "have I been here" once per cell per
// neighbor, so a search over four hundred cells asks it sixteen hundred times
// against a list that ends four hundred long — a quarter of a million
// comparisons for a question that is a lookup.
//
// What is pinned here is BOTH halves: the same answers as the scan, and the
// staleness the cache could introduce, which is the only way an index like this
// goes wrong.

import {describe, expect, it} from 'vitest';

import {addTo, addToFront, listHas, takeFirst} from '../core/lists';
import {Vector} from '../core/Vector';

describe('a list that is asked what it holds', () => {
  it('answers about places by value, not by identity', () => {
    const places = [new Vector(1, 2), new Vector(3, 4)];
    expect(listHas(places, new Vector(3, 4))).toBe(true);
    expect(listHas(places, new Vector(4, 3))).toBe(false);
  });

  it('keeps answering as the list grows', () => {
    // The staleness the cache could introduce: `addTo` pushes IN PLACE, so an
    // index keyed on the array alone would answer about the list as it was.
    const seen: unknown[] = [];
    addTo(seen, new Vector(0, 0));
    expect(listHas(seen, new Vector(0, 0))).toBe(true);
    expect(listHas(seen, new Vector(32, 0))).toBe(false);

    addTo(seen, new Vector(32, 0));
    expect(listHas(seen, new Vector(32, 0))).toBe(true);

    addToFront(seen, new Vector(64, 0));
    expect(listHas(seen, new Vector(64, 0))).toBe(true);
  });

  it('keeps answering as the list shrinks', () => {
    const queue: unknown[] = [];
    addTo(queue, 1);
    addTo(queue, 2);
    expect(listHas(queue, 1)).toBe(true);

    expect(takeFirst(queue)).toBe(1);
    expect(listHas(queue, 1)).toBe(false);
    expect(listHas(queue, 2)).toBe(true);
  });

  it('answers a queue that stays the same length', () => {
    // The one a length-keyed cache gets wrong, and the pattern every search
    // uses: one off the front and one on the back, once per turn round.
    const queue: unknown[] = [];
    addTo(queue, new Vector(0, 0));
    addTo(queue, new Vector(1, 0));
    expect(listHas(queue, new Vector(0, 0))).toBe(true);

    takeFirst(queue);
    addTo(queue, new Vector(2, 0));

    expect(listHas(queue, new Vector(0, 0))).toBe(false);
    expect(listHas(queue, new Vector(2, 0))).toBe(true);
  });

  it('holds numbers and words apart', () => {
    // The keys carry the kind, so a list of the word "1" does not hold the
    // number 1 — which `Array.includes` would also say, and a naive string key
    // would not.
    expect(listHas(['1'], 1)).toBe(false);
    expect(listHas([1], '1')).toBe(false);
  });

  it('still answers about things a key cannot be made of', () => {
    // An actor, say: unkeyable, so the scan is what it always was.
    const one = {name: 'a'};
    const other = {name: 'b'};
    expect(listHas([one, other], one)).toBe(true);
    expect(listHas([one], other)).toBe(false);
  });

  it('looks at the list once however many times it is asked', () => {
    // The point. Count the reads: a scan touches every entry per question.
    let reads = 0;
    const watched = new Proxy([] as unknown[], {
      get(target, key, receiver) {
        if (typeof key === 'string' && /^\d+$/.test(key)) {
          reads++;
        }
        return Reflect.get(target, key, receiver);
      },
    });
    for (let i = 0; i < 200; i++) {
      addTo(watched, new Vector(i, 0));
    }
    reads = 0;

    for (let i = 0; i < 200; i++) {
      listHas(watched, new Vector(i, 0));
    }

    // One pass to build the index, and nothing after it. A scan would be
    // 200 × 100 on average — twenty thousand.
    expect(reads).toBeLessThan(400);
  });
});

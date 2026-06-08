import type * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {
  forciblyInsertTopBlock,
  insertCollider,
  isOverlapping,
  partitionJsonBlocksByType,
} from './serialization';
import type {Collider} from './types';

const collider = (x: number, y: number, width = 10, height = 10): Collider => ({
  x,
  y,
  width,
  height,
});

// partitionJsonBlocksByType only reads `.type`; a minimal stand-in suffices.
const block = (type: string) => ({type}) as Blockly.BlockSvg;

describe('partitionJsonBlocksByType', () => {
  it('moves prioritized types to the front, preserving relative order', () => {
    const blocks = [block('a'), block('when_run'), block('b'), block('setup')];
    const ordered = partitionJsonBlocksByType(blocks, ['when_run', 'setup']);
    expect(ordered.map(b => b.type)).toEqual(['when_run', 'setup', 'a', 'b']);
  });

  it('is a no-op ordering when nothing matches', () => {
    const blocks = [block('a'), block('b')];
    expect(partitionJsonBlocksByType(blocks, ['x']).map(b => b.type)).toEqual([
      'a',
      'b',
    ]);
  });

  it('defaults to an empty result with no arguments', () => {
    expect(partitionJsonBlocksByType()).toEqual([]);
  });
});

describe('insertCollider', () => {
  it('keeps the list ordered by bottom edge and mutates in place', () => {
    const colliders: Collider[] = [collider(0, 0), collider(0, 100)];
    insertCollider(colliders, collider(0, 50));
    expect(colliders.map(c => c.y)).toEqual([0, 50, 100]);
  });

  it('appends when the new collider is the lowest', () => {
    const colliders: Collider[] = [collider(0, 0), collider(0, 50)];
    insertCollider(colliders, collider(0, 200));
    expect(colliders.map(c => c.y)).toEqual([0, 50, 200]);
  });

  it('inserts at the front when the new collider is the highest', () => {
    const colliders: Collider[] = [collider(0, 50)];
    insertCollider(colliders, collider(0, 0));
    expect(colliders.map(c => c.y)).toEqual([0, 50]);
  });
});

describe('isOverlapping', () => {
  it('detects overlap when the rectangles intersect', () => {
    expect(
      isOverlapping(collider(0, 0, 20, 20), collider(10, 10, 20, 20)),
    ).toBe(true);
  });

  it('returns false when separated on the x axis', () => {
    expect(isOverlapping(collider(0, 0, 10, 10), collider(50, 0, 10, 10))).toBe(
      false,
    );
  });

  it('returns false when separated on the y axis', () => {
    expect(isOverlapping(collider(0, 0, 10, 10), collider(0, 50, 10, 10))).toBe(
      false,
    );
  });

  it('treats edge-to-edge rectangles as non-overlapping', () => {
    // collider1 right edge (10) meets collider2 left edge (10): no overlap.
    expect(isOverlapping(collider(0, 0, 10, 10), collider(10, 0, 10, 10))).toBe(
      false,
    );
  });
});

describe('forciblyInsertTopBlock', () => {
  // Build an <xml>-style root of <block type=...> children in the jsdom DOM.
  const rootOf = (...types: string[]) => {
    const root = document.createElement('xml');
    for (const type of types) {
      const el = document.createElement('block');
      el.setAttribute('type', type);
      root.appendChild(el);
    }
    return root;
  };

  const childTypes = (el: Element) =>
    Array.from(el.children).map(c => c.getAttribute('type'));

  it('wraps the first block under a new immovable top block', () => {
    const root = rootOf('foo');
    forciblyInsertTopBlock(root, 'when_run');

    expect(childTypes(root)).toEqual(['when_run']);
    const top = root.children[0];
    expect(top.getAttribute('id')).toBe('topBlock');
    expect(top.getAttribute('movable')).toBe('false');
    expect(top.getAttribute('deletable')).toBe('false');
    // when_run -> next -> foo
    expect(top.querySelector('next > block')?.getAttribute('type')).toBe('foo');
  });

  it('does nothing when a block of that type is already present', () => {
    const root = rootOf('when_run', 'foo');
    forciblyInsertTopBlock(root, 'when_run');
    expect(childTypes(root)).toEqual(['when_run', 'foo']);
  });

  it('skips procedure definitions when choosing the block to wrap', () => {
    const root = rootOf('procedures_defnoreturn', 'bar');
    forciblyInsertTopBlock(root, 'when_run');

    // the top block is inserted ahead of the surviving definition...
    expect(childTypes(root)).toEqual(['when_run', 'procedures_defnoreturn']);
    // ...and wraps the first non-definition block, not the definition.
    expect(
      root.children[0].querySelector('next > block')?.getAttribute('type'),
    ).toBe('bar');
  });

  it('appends a bare top block when the root is empty', () => {
    const root = rootOf();
    forciblyInsertTopBlock(root, 'when_run');
    expect(childTypes(root)).toEqual(['when_run']);
    expect(root.children[0].querySelector('next')).toBeNull();
  });
});

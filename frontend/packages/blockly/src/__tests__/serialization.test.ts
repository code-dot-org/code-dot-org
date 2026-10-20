import type * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {
  insertCollider,
  isOverlapping,
  partitionJsonBlocksByType,
} from '../serialization';
import type {Collider} from '../types';

const collider = (x: number, y: number, width = 10, height = 10): Collider => ({
  x,
  y,
  width,
  height,
});

// partitionJsonBlocksByType only reads `.type`; a minimal stand-in suffices.
const block = (type: string) => ({type}) as Blockly.BlockSvg;

describe('layout.md: partitionJsonBlocksByType', () => {
  it('LAY-3: moves prioritized types to the front, preserving relative order', () => {
    const blocks = [block('a'), block('when_run'), block('b'), block('setup')];
    const ordered = partitionJsonBlocksByType(blocks, ['when_run', 'setup']);
    expect(ordered.map(b => b.type)).toEqual(['when_run', 'setup', 'a', 'b']);
  });

  it('LAY-3: is a no-op ordering when nothing matches', () => {
    const blocks = [block('a'), block('b')];
    expect(partitionJsonBlocksByType(blocks, ['x']).map(b => b.type)).toEqual([
      'a',
      'b',
    ]);
  });

  it('LAY-3: defaults to an empty result with no arguments', () => {
    expect(partitionJsonBlocksByType()).toEqual([]);
  });
});

describe('layout.md: insertCollider', () => {
  it('LAY-8: keeps the list ordered by bottom edge and mutates in place', () => {
    const colliders: Collider[] = [collider(0, 0), collider(0, 100)];
    insertCollider(colliders, collider(0, 50));
    expect(colliders.map(c => c.y)).toEqual([0, 50, 100]);
  });

  it('LAY-8: appends when the new collider is the lowest', () => {
    const colliders: Collider[] = [collider(0, 0), collider(0, 50)];
    insertCollider(colliders, collider(0, 200));
    expect(colliders.map(c => c.y)).toEqual([0, 50, 200]);
  });

  it('LAY-8: inserts at the front when the new collider is the highest', () => {
    const colliders: Collider[] = [collider(0, 50)];
    insertCollider(colliders, collider(0, 0));
    expect(colliders.map(c => c.y)).toEqual([0, 50]);
  });
});

describe('layout.md: isOverlapping', () => {
  it('LAY-7: detects overlap when the rectangles intersect', () => {
    expect(
      isOverlapping(collider(0, 0, 20, 20), collider(10, 10, 20, 20)),
    ).toBe(true);
  });

  it('LAY-7: returns false when separated on the x axis', () => {
    expect(isOverlapping(collider(0, 0, 10, 10), collider(50, 0, 10, 10))).toBe(
      false,
    );
  });

  it('LAY-7: returns false when separated on the y axis', () => {
    expect(isOverlapping(collider(0, 0, 10, 10), collider(0, 50, 10, 10))).toBe(
      false,
    );
  });

  it('LAY-7: treats edge-to-edge rectangles as non-overlapping', () => {
    // collider1 right edge (10) meets collider2 left edge (10): no overlap.
    expect(isOverlapping(collider(0, 0, 10, 10), collider(10, 0, 10, 10))).toBe(
      false,
    );
  });
});

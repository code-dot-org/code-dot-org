import {describe, expect, it} from 'vitest';

import {Group} from '../Group';
import type {Sprite} from '../Sprite';

import {frame, makeInstance} from './harness';

describe('group.md', () => {
  it('GRP-1, GRP-2: a group is an Array made by new p.Group() or createGroup()', async () => {
    const p = await makeInstance();
    const g = new p.Group();
    const h = p.createGroup();
    for (const group of [g, h]) {
      expect(Array.isArray(group)).toBe(true);
      expect(group instanceof Array).toBe(true);
      expect(group).toBeInstanceOf(Group);
      expect(group.length).toBe(0);
    }
  });

  it('GRP-1: map and filter return plain arrays', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite(1, 0);
    const b = p.createSprite(2, 0);
    g.add(a);
    g.add(b);
    expect(g.map(s => s.x)).toEqual([1, 2]);
    expect(g.filter(s => s.x > 1)).toEqual([b]);
    const seen: Sprite[] = [];
    g.forEach(s => seen.push(s));
    expect(seen).toEqual([a, b]);
  });

  it('GRP-3..GRP-5, G1: add, get, size, contains, indexOf', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite();
    const b = p.createSprite();
    g.add(a);
    g.add(a);
    g.add(b);
    expect(g.size()).toBe(2);
    expect(g.length).toBe(2);
    expect(a.groups.length).toBe(2);
    expect(g.get(0)).toBe(a);
    expect(g.get(5)).toBeUndefined();
    expect(g.contains(b)).toBe(true);
    expect(g.indexOf(b)).toBe(1);
    expect(Array.isArray(g)).toBe(true);
  });

  it('CMP-39, GRP-5, G2: adding a non-sprite throws', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    expect(() => g.add({} as Sprite)).toThrow(
      'you can only add sprites to a group',
    );
    try {
      g.add({} as Sprite);
    } catch (e) {
      expect(String(e)).toBe('Error: you can only add sprites to a group');
    }
  });

  it('CMP-39, GRP-6, G3: removing a non-sprite throws', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    try {
      g.remove({} as Sprite);
      expect.unreachable();
    } catch (e) {
      expect(String(e)).toBe('Error: you can only remove sprites from a group');
    }
  });

  it('GRP-6, G4: remove returns whether it removed and does not destroy', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite();
    const b = p.createSprite();
    g.add(a);
    g.add(b);
    expect(g.remove(a)).toBe(true);
    expect(g.remove(a)).toBe(false);
    expect(g.size()).toBe(1);
    expect(a.groups.length).toBe(1);
    expect(p.allSprites.contains(a)).toBe(true);
    expect(a.removed).toBe(false);
  });

  it('GRP-6: every occurrence is removed, from the group and the back-references', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite();
    g.push(a, a);
    a.groups.push(g, g);
    expect(g.remove(a)).toBe(true);
    expect(g.length).toBe(0);
    expect(a.groups).toEqual([p.allSprites]);
  });

  it('CMP-10, CMP-41, GRP-8, G5: clear empties only the array', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite();
    const b = p.createSprite();
    g.add(a);
    g.add(b);
    g.clear();
    expect(g.size()).toBe(0);
    expect(a.groups.length).toBe(2);
    expect(b.groups.length).toBe(2);
    expect(() => a.remove()).not.toThrow();
    expect(g.remove(b)).toBe(false);
  });

  it('GRP-14, G6: removing a sprite takes it out of every group', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite();
    const b = p.createSprite();
    g.add(a);
    g.add(b);
    b.remove();
    expect(g.size()).toBe(1);
    expect(p.allSprites.contains(b)).toBe(false);
    expect(b.groups.length).toBe(0);
  });

  it('GRP-7, G7: removeSprites removes each member everywhere', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const h = p.createGroup();
    const a = p.createSprite();
    const c = p.createSprite();
    g.add(a);
    g.add(c);
    h.add(c);
    g.removeSprites();
    expect(g.size()).toBe(0);
    expect(a.removed).toBe(true);
    expect(c.removed).toBe(true);
    expect(h.size()).toBe(0);
    expect(p.allSprites.size()).toBe(0);
  });

  it('CMP-11, GRP-9, G8: depth bounds of an empty group', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    expect(g.maxDepth()).toBe(0);
    expect(g.minDepth()).toBe(99999);
    expect(g.size()).toBe(0);
  });

  it('CMP-8, GRP-9: depth bounds, and NaN', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite();
    const b = p.createSprite();
    a.depth = 3;
    b.depth = -2;
    g.add(a);
    g.add(b);
    expect([g.maxDepth(), g.minDepth()]).toEqual([3, -2]);
    b.depth = NaN;
    expect(g.maxDepth()).toBeNaN();
    expect(g.minDepth()).toBeNaN();
  });

  it('GRP-12, G9, G10, G11: drawSprites sorts stably by depth, in place', async () => {
    const p = await makeInstance();
    const a = p.createSprite();
    const b = p.createSprite();
    const c = p.createSprite();
    a.depth = 5;
    b.depth = 2;
    c.depth = 2;
    const g = p.createGroup();
    g.add(a);
    g.add(c);
    await frame(p, () => p.drawSprites());
    expect([...p.allSprites]).toEqual([b, c, a]);
    b.depth = 1;
    c.depth = 1;
    await frame(p, () => p.drawSprites());
    expect([...p.allSprites]).toEqual([b, c, a]);
    expect([...g]).toEqual([a, c]);
    p.drawSprites(g);
    expect([...g]).toEqual([c, a]);
  });

  it('GRP-10, GRP-11, G12: allSprites is World.allSprites and every sprite joins it first', async () => {
    const p = await makeInstance();
    expect(p.allSprites).toBe(p.World.allSprites);
    const s = p.createSprite();
    expect(s.groups[0]).toBe(p.allSprites);
    const t = p.createSprite();
    t.remove();
    expect([...p.allSprites]).toEqual([s]);
  });

  it('GRP-4, G13: toArray is a new plain array', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite();
    g.add(a);
    const array = g.toArray();
    expect(array).not.toBe(g);
    expect(array).toEqual([a]);
    expect(array).not.toBeInstanceOf(Group);
  });

  it('GRP-15: sprite.group is unrelated to groups', async () => {
    const p = await makeInstance();
    const s = p.createSprite() as Sprite & {group?: string};
    s.group = 'walls';
    expect(s.groups).toEqual([p.allSprites]);
  });
});

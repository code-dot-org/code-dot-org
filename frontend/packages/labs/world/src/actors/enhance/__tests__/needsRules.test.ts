// What a row of the checklist would take from the library, worked out by
// taking it (specs/ENHANCE_GATE_PLAN.md).

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT, buildProject} from '../../../constants';
import type {ProjectSpec} from '../../../constants';
import {ENHANCEMENTS} from '../enhancements';
import type {EnhanceTarget} from '../enhancements';
import {rulesAddedBy} from '../needsRules';

/** A project with one actor in it and no rules at all. */
const bare = (): ProjectSpec => ({
  folders: ['actors', 'rules', 'worlds'],
  files: {
    hero: {
      name: 'hero.actor',
      language: 'actor',
      contents: JSON.stringify({
        blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Hero'}}]},
      }),
      folderId: 'actors',
    },
  },
  open: [],
});

const source = buildProject(bare()).source;
const HERO: EnhanceTarget = {kind: 'actor', path: 'actors/hero', name: 'Hero'};
const row = (id: string) => ENHANCEMENTS.find(one => one.id === id)!;

describe('rulesAddedBy', () => {
  it('names the rule a row asks for', () => {
    expect(rulesAddedBy(source, HERO, row('falls'))).toContain('gravity');
  });

  it('names the ones those pull in behind them', () => {
    // Arrow Keys reads the keyboard and moves things: three files land for
    // one tick, and a gate that knew only the first would let two through.
    const added = rulesAddedBy(source, HERO, row('top-down-controls'));
    expect(added).toContain('arrows');
    expect(added).toContain('input');
    expect(added.length).toBeGreaterThan(2);
  });

  it('names nothing for a rule the project already holds', () => {
    // The shelf governs what a project can TAKE, not what it has: the
    // starter holds Gravity, so falling takes nothing.
    const starter = DEFAULT_PROJECT.source;
    const player = {
      kind: 'actor',
      path: 'actors/player',
      name: 'Player',
    } as const;
    expect(rulesAddedBy(starter, player, row('falls'))).toEqual([]);
  });

  it('names nothing for a row that will not apply here', () => {
    // Whether a row is offered at all is another question's
    // (`Enhancement.offered`); this one does not throw over it.
    for (const one of ENHANCEMENTS) {
      expect(() => rulesAddedBy(source, HERO, one), one.id).not.toThrow();
    }
  });
});

// The eye on a `use rule` / `use trait` block: when it is there, and what it
// points at.
//
// Three things have to agree before a block offers to open a file: the level
// allows it, the project HAS the file, and something is listening that can open
// one. Each of them is a way for the button to be wrong — an eye that opens
// nothing, or a missing eye on a rule the learner could have read.

import type {Block} from 'blockly';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {createLevelPropertyFixture} from '@code-dot-org/core/api/mocks';

import {
  hiddenToolboxCategories,
  showsFileBrowser,
  showsRuleSource,
  type WorldLevelProperties,
} from '../../levelData';
import {LevelKindSchema} from '../../schema';
import {moduleNamedBy} from '../extensions/openSourceButton';
import {
  canOpenModule,
  openModule,
  setModuleOpener,
  setModuleOpeningOffered,
  setOpenableModules,
} from '../openModule';

import {registerDefaultProjectRules} from './defaultProjectRules';

/** A block that answers `getFieldValue` and nothing else. */
const block = (fields: Record<string, string>) =>
  ({
    getFieldValue: (name: string) => fields[name] ?? null,
  }) as unknown as Block;

registerDefaultProjectRules();

beforeEach(() => {
  setModuleOpener(null);
  setOpenableModules([]);
  setModuleOpeningOffered(true);
});

describe('what a block names', () => {
  it('resolves a rule by name to the module that rule lives in', () => {
    // `use rule Has Gravity` stores "Gravity"; where that is, is the registry's
    // answer, which is the whole reason a rename does not break this.
    expect(moduleNamedBy(block({RULE: 'Gravity'}))).toBe('rules/gravity');
  });

  it('resolves a trait through the rule it belongs to', () => {
    expect(
      moduleNamedBy(block({TRAIT: 'Gravity#AffectedByGravityTrait'})),
    ).toBe('rules/gravity');
  });

  it('names nothing for a built-in, whose implementation is not in the project', () => {
    expect(moduleNamedBy(block({RULE: 'Space'}))).toBeUndefined();
    expect(
      moduleNamedBy(block({TRAIT: 'Appearance#AppearanceTrait'})),
    ).toBeUndefined();
  });

  it('takes an unknown value as a module — a hand-written `.js` rule', () => {
    // A `.js` rule declares no name to be looked up by, so it is named by its
    // file, and that file is exactly what there is to open.
    expect(moduleNamedBy(block({RULE: 'rules/animation'}))).toBe(
      'rules/animation',
    );
  });
});

describe('whether the button is offered', () => {
  it('needs a file, an opener, and the level’s permission', () => {
    expect(canOpenModule('rules/gravity')).toBe(false); // nothing registered

    setOpenableModules(['rules/gravity']);
    expect(canOpenModule('rules/gravity')).toBe(false); // no opener yet

    setModuleOpener(vi.fn());
    expect(canOpenModule('rules/gravity')).toBe(true);
    expect(canOpenModule('rules/nothing')).toBe(false);
    expect(canOpenModule(undefined)).toBe(false);

    setModuleOpeningOffered(false);
    expect(canOpenModule('rules/gravity')).toBe(false);
  });

  it('opens only what it would show a button for', () => {
    const opener = vi.fn();
    setModuleOpener(opener);
    setOpenableModules(['rules/gravity']);

    openModule('rules/gravity');
    expect(opener).toHaveBeenCalledWith('rules/gravity');

    openModule('rules/nothing');
    expect(opener).toHaveBeenCalledTimes(1);
  });
});

describe('what the level says', () => {
  it('offers the button unless a level turns it off', () => {
    expect(showsRuleSource(undefined)).toBe(true);
    expect(showsRuleSource({} as WorldLevelProperties)).toBe(true);
    expect(
      showsRuleSource({
        levelData: {showRuleSource: true},
      } as WorldLevelProperties),
    ).toBe(true);
    expect(
      showsRuleSource({
        levelData: {showRuleSource: false},
      } as WorldLevelProperties),
    ).toBe(false);
  });

  it('shows the file browser unless a level turns it off', () => {
    expect(showsFileBrowser(undefined)).toBe(true);
    expect(
      showsFileBrowser({
        levelData: {showFileBrowser: false},
      } as WorldLevelProperties),
    ).toBe(false);
  });

  it('hides no toolbox categories unless a level names some', () => {
    expect(hiddenToolboxCategories(undefined)).toEqual([]);
    expect(
      hiddenToolboxCategories({
        levelData: {hiddenToolboxCategories: ['Gravity', 'Loops']},
      } as WorldLevelProperties),
    ).toEqual(['Gravity', 'Loops']);
  });

  it('lets `levelData` through validation', () => {
    // Zod objects drop keys they were not told about, so a lab's level data
    // reaches it only through a registered kind schema. Without this the
    // property parses away silently and every level looks like the default.
    // Built on the fixture helper, which fills in the base properties a real
    // level always has — the point here is the one field this lab added.
    const parsed = LevelKindSchema.parse(
      createLevelPropertyFixture({
        id: 1,
        name: 'World Lab',
        type: 'World',
        appName: 'world',
        offerBrowserTts: false,
        showExemplarLink: false,
        levelData: {
          showRuleSource: false,
          showFileBrowser: false,
          hiddenToolboxCategories: ['Gravity'],
        },
      }),
    ) as {levelData?: Record<string, unknown>};
    expect(parsed.levelData).toEqual({
      showRuleSource: false,
      showFileBrowser: false,
      hiddenToolboxCategories: ['Gravity'],
    });
  });
});

// Actors, which had no way in at all.
//
// `WorldLayout` states the invariant — "every other file is reachable from a
// block that names it" — and it was false for actors. In a level with the file
// browser hidden, importing one wrote `actors/coin.actor` and left no way to
// read it: no list to find it in, and no eye on the block that named it. The
// student had to already know it was there.
describe('an actor a block names', () => {
  it('is the module the field holds', () => {
    // Direct, like a map and unlike a rule: an actor declares no name for a
    // registry to resolve, so the field IS the path.
    expect(moduleNamedBy(block({ACTOR: 'actors/coin'}))).toBe('actors/coin');
  });

  it('is read from TYPE too, which `is a` calls it', () => {
    expect(moduleNamedBy(block({TYPE: 'actors/crate'}))).toBe('actors/crate');
  });

  it('is nothing for an actor defined inside the world', () => {
    // `local:<block id>` names a `define actor` in this very workspace. There
    // is no file, and an eye offering to open one would be a lie.
    expect(moduleNamedBy(block({ACTOR: 'local:abc123'}))).toBeUndefined();
  });

  it('is nothing for a TYPE that is a kind of VALUE', () => {
    // `world_rule_property` calls its field TYPE as well, and holds "number".
    // A module path always names its folder, so the slash tells them apart.
    expect(moduleNamedBy(block({TYPE: 'number'}))).toBeUndefined();
  });

  it('gets an eye once the project has the file', () => {
    setModuleOpener(() => {});
    setOpenableModules(['actors/coin']);

    expect(canOpenModule('actors/coin')).toBe(true);
    expect(canOpenModule('actors/nothing')).toBe(false);
  });

  it('loses it when the level says so', () => {
    // A level's call, as it is for a rule: reading is not always the lesson.
    setModuleOpener(() => {});
    setOpenableModules(['actors/coin']);
    setModuleOpeningOffered(false);

    expect(canOpenModule('actors/coin')).toBe(false);
  });
});

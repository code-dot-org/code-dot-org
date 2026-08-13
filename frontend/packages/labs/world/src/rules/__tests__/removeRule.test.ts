// Taking a rule out of a project — which is now how a world loses a mechanic.
//
// The weight these carry went up when holding a rule became what puts it in
// play (blockly/projectModules). Deleting `rules/motion.rule` used to be
// housekeeping on a file nothing named; it is now "this world stops moving",
// and the thing underneath somebody else may still be standing on.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {whyKeepFile} from '../deleteGuard';
import {filesUsing, heldRules, removeRule, rulesRequiring} from '../removeRule';

/** A `.rule` workspace declaring a name, an ability, traits and dependencies. */
const ruleFile = (
  name: string,
  {
    ability,
    requires = [],
    traits = [],
  }: {ability?: string; requires?: string[]; traits?: string[]} = {},
) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_rule',
          fields: {NAME: name, ...(ability ? {ABILITY: ability} : {})},
          ...(requires.length
            ? {
                next: {
                  block: requires.reduceRight<object | undefined>(
                    (next, dep) => ({
                      type: 'world_use_rule',
                      fields: {RULE: dep},
                      ...(next ? {next: {block: next}} : {}),
                    }),
                    undefined,
                  ) as object,
                },
              }
            : {}),
        },
        ...traits.map(trait => ({
          type: 'world_rule_trait',
          fields: {NAME: trait},
        })),
      ],
    },
  });

/** A project with a `rules/` folder holding the given files. */
const project = (files: Record<string, string>): MultiFileSource => ({
  folders: {r: {id: 'r', name: 'rules', parentId: '0'}},
  files: Object.fromEntries(
    Object.entries(files).map(([name, contents], index) => [
      `f${index}`,
      {id: `f${index}`, name, language: 'rule', contents, folderId: 'r'},
    ]),
  ),
  openFiles: [],
});

describe('heldRules', () => {
  it('lists what the project holds, which is what is in play', () => {
    const source = project({
      'gravity.rule': ruleFile('Gravity', {
        ability: 'Has Gravity',
        traits: ['Affected by Gravity', 'Acts as Ground'],
      }),
      'motion.rule': ruleFile('Physics', {ability: 'Has Physics'}),
    });

    expect(
      heldRules(source).map(rule => [rule.name, rule.ability, rule.fileName]),
    ).toEqual([
      ['Gravity', 'Has Gravity', 'gravity.rule'],
      ['Physics', 'Has Physics', 'motion.rule'],
    ]);
    expect(heldRules(source)[0].provides).toEqual([
      'Affected by Gravity',
      'Acts as Ground',
    ]);
  });

  it('sorts by name, so adding one does not reshuffle the list', () => {
    const source = project({
      'z.rule': ruleFile('Alpha'),
      'a.rule': ruleFile('Zulu'),
    });
    expect(heldRules(source).map(rule => rule.name)).toEqual(['Alpha', 'Zulu']);
  });

  it('names a `.js` rule by its file, having nothing else to go on', () => {
    // It is in play like any other — the world generator emits every module
    // under `rules/` — so leaving it out of the panel would be a rule running
    // that nothing on screen admits to.
    const source = project({'mine.js': 'export default rule;'});
    const [held] = heldRules(source);

    expect(held.name).toBe('mine');
    expect(held.ability).toBeUndefined();
    expect(held.provides).toEqual([]);
  });

  it('is empty for a project with no rules folder', () => {
    expect(heldRules({folders: {}, files: {}, openFiles: []})).toEqual([]);
  });
});

describe('rulesRequiring', () => {
  it('names what would break, before anything is deleted', () => {
    // The failure this exists to pre-empt: a rule naming one the project has
    // not got fails at COMPILE time, and nothing on screen connects that to
    // the delete that caused it.
    const source = project({
      'motion.rule': ruleFile('Physics'),
      'gravity.rule': ruleFile('Gravity', {requires: ['Physics']}),
      'drive.rule': ruleFile('Arrow Drive', {requires: ['Physics']}),
    });
    const physics = heldRules(source).find(rule => rule.name === 'Physics')!;

    expect(rulesRequiring(source, physics)).toEqual(['Arrow Drive', 'Gravity']);
  });

  it('does not count the rule itself, however it refers to itself', () => {
    const source = project({
      'wind.rule': ruleFile('Wind', {requires: ['Wind']}),
    });
    const [wind] = heldRules(source);

    expect(rulesRequiring(source, wind)).toEqual([]);
  });

  it('is empty when nothing depends on it', () => {
    const source = project({
      'gravity.rule': ruleFile('Gravity'),
      'wind.rule': ruleFile('Wind'),
    });
    const [gravity] = heldRules(source);

    expect(rulesRequiring(source, gravity)).toEqual([]);
  });
});

describe('filesUsing', () => {
  it('names the actors and worlds that refer to the rule', () => {
    // The commoner way a rule is load-bearing, and the one the panel warns
    // about rather than blocking: an actor elects one of its traits, and
    // deleting the rule fails at compile with `cannot resolve 'rules/gravity'
    // from 'actors/player.actor'` — a file the learner was not looking at.
    const source = project({'gravity.rule': ruleFile('Gravity')});
    source.files.player = {
      id: 'player',
      name: 'player.actor',
      language: 'actor',
      folderId: 'a',
      contents: JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_use_trait',
              fields: {TRAIT: 'Gravity#AffectedByGravityTrait'},
            },
          ],
        },
      }),
    };
    const [gravity] = heldRules(source);

    expect(filesUsing(source, gravity)).toEqual(['player.actor']);
  });

  it('is not fooled by a block type built from the rule’s name', () => {
    // `world_get_Gravity_AmountOfGravityProperty` is a block TYPE, not a
    // reference — a project full of them may still not name the rule. The `#`
    // is what tells the two apart.
    const source = project({'gravity.rule': ruleFile('Gravity')});
    source.files.world = {
      id: 'world',
      name: 'main.world',
      language: 'world',
      folderId: 'w',
      contents: '{"blocks":{"blocks":[{"type":"world_get_Gravity_Amount"}]}}',
    };
    const [gravity] = heldRules(source);

    expect(filesUsing(source, gravity)).toEqual([]);
  });
});

describe('removeRule', () => {
  it('deletes the file, and only that file', () => {
    // The rules it brought in when it was imported stay: by now they may be
    // holding somebody else up, and a delete that quietly took three files
    // would be a worse surprise than one leaving two to delete by hand.
    const source = project({
      'gravity.rule': ruleFile('Gravity', {requires: ['Physics']}),
      'motion.rule': ruleFile('Physics'),
    });
    const gravity = heldRules(source).find(rule => rule.name === 'Gravity')!;

    const next = removeRule(source, gravity);

    expect(Object.values(next.files).map(file => file.name)).toEqual([
      'motion.rule',
    ]);
  });

  it('takes the tab with it', () => {
    // A file id left in `openFiles` is a tab pointing at nothing, which the
    // editor would try to open on the next load.
    const source = project({'gravity.rule': ruleFile('Gravity')});
    const [gravity] = heldRules(source);
    const open = {...source, openFiles: [gravity.fileId, 'other']};

    expect(removeRule(open, gravity).openFiles).toEqual(['other']);
  });

  it('leaves the original alone', () => {
    // The panel re-reads the project after every change; a transform that
    // mutated in place would have already changed what it is about to read.
    const source = project({'gravity.rule': ruleFile('Gravity')});
    const [gravity] = heldRules(source);

    removeRule(source, gravity);

    expect(Object.keys(source.files)).toHaveLength(1);
  });
});

describe('whyKeepFile', () => {
  // The file TREE's delete, asking what the rules panel asks. Two routes to the
  // same act, and before this only one of them knew that deleting
  // `rules/motion.rule` took Physics out from under four other rules.
  const file = (name: string) => ({
    id: 'x',
    name,
    language: 'rule',
    contents: '',
    folderId: 'r',
  });

  it('refuses a rule another rule requires, and says which', () => {
    const source = project({
      'motion.rule': ruleFile('Physics'),
      'gravity.rule': ruleFile('Gravity', {requires: ['Physics']}),
      'drive.rule': ruleFile('Arrow Drive', {requires: ['Physics']}),
    });

    expect(whyKeepFile(file('motion.rule'), source)).toContain(
      'Arrow Drive, Gravity',
    );
  });

  it('allows one nothing else needs', () => {
    const source = project({
      'motion.rule': ruleFile('Physics'),
      'gravity.rule': ruleFile('Gravity', {requires: ['Physics']}),
    });

    expect(whyKeepFile(file('gravity.rule'), source)).toBeUndefined();
  });

  it('has nothing to say about a file that is not a rule', () => {
    // Every delete in the tree comes through here, so the common answer has to
    // be "not mine".
    const source = project({'motion.rule': ruleFile('Physics')});

    expect(whyKeepFile(file('player.actor'), source)).toBeUndefined();
  });
});

import {describe, expect, it} from 'vitest';

import {FOUNDATION_RULE_NAMES} from '../foundation';
import {
  projectActorOptions,
  projectAnimationFileOptions,
  projectEffectFileOptions,
  projectEffectParameters,
  projectMapActorTypes,
  projectRuleOptions,
  projectWorldOptions,
  projectWorldRules,
} from '../projectModules';

const FILES = {
  'maps/level1.map': '{}',
  'worlds/platform.world': JSON.stringify({
    blocks: {
      blocks: [
        {type: 'world_world', fields: {ID: 'platform', NAME: 'Platform World'}},
      ],
    },
  }),
  'actors/player.actor': JSON.stringify({
    blocks: {
      blocks: [{type: 'world_actor', fields: {ID: 'player', NAME: 'Player'}}],
    },
  }),
  'actors/ground.js': `export default new ActorBuilder({id: 'ground', name: 'Ground'});`,
  'actors/blob.js': `export default 42;`, // no builder → basename fallback
  'animations/game.anim': '{"type":"animation"}',
};

describe('projectModules', () => {
  it('labels actors by authored name, value = extension-less path', () => {
    expect(projectActorOptions(FILES).sort()).toEqual([
      ['Blob', 'actors/blob'], // fallback: Title-cased basename
      ['Ground', 'actors/ground'], // from the JS builder `name`
      ['Player', 'actors/player'], // from the Blockly NAME field
    ]);
  });

  it('labels a world by its authored name, not the file stem', () => {
    // File is `platform` but the world calls itself "Platform World".
    expect(projectWorldOptions(FILES)).toEqual([
      ['Platform World', 'worlds/platform'],
    ]);
  });

  it('lists animation files under animations/ as extension-less paths', () => {
    expect(projectAnimationFileOptions(FILES)).toEqual([
      ['Game', 'animations/game'],
    ]);
  });

  it('lists rule modules under rules/, labelled by their RuleBuilder name', () => {
    const files = {
      ...FILES,
      'rules/gravity.js': `const rule = new RuleBuilder({id: 'gravity', name: 'Has Gravity'});\nexport default rule.build();`,
      'rules/shim.js': `export {InputRule as default} from 'world-lab';`, // no name → stem
    };
    expect(projectRuleOptions(files).sort()).toEqual([
      ['Has Gravity', 'rules/gravity'], // from the RuleBuilder `name`
      ['Shim', 'rules/shim'], // fallback: Title-cased basename
    ]);
    // Rules are not mistaken for actors/worlds.
    expect(projectActorOptions(files).map(([, p]) => p)).not.toContain(
      'rules/gravity',
    );
  });

  it('ignores non-code files and other directories', () => {
    const paths = projectActorOptions(FILES).map(([, path]) => path);
    expect(paths).not.toContain('animations/game');
    expect(paths).not.toContain('maps/level1');
  });
});

describe('projectMapActorTypes', () => {
  it('maps a map path to the distinct actor modules it places', () => {
    const files = {
      'maps/level1.map': JSON.stringify({
        type: 'map',
        actors: [
          {type: 'actors/player'},
          {type: 'actors/coin'},
          {type: 'actors/coin'}, // deduped
        ],
      }),
      'maps/empty.map': 'not json yet',
      'actors/player.actor': '{}',
    };
    const maps = projectMapActorTypes(files);
    expect(maps['maps/level1']).toEqual(['actors/player', 'actors/coin']);
    expect(maps['maps/empty']).toEqual([]); // invalid JSON → no types
    expect(maps['actors/player']).toBeUndefined(); // not under maps/
  });
});

describe('projectWorldRules', () => {
  /** A `.rule` file, as the project holds it: a `define rule` naming itself. */
  const ruleFile = (name: string) =>
    JSON.stringify({
      blocks: {blocks: [{type: 'world_rule', fields: {NAME: name}}]},
    });

  it('is every rule the project holds, whatever any world says', () => {
    // The change this is here to pin: it used to read the `use rule` blocks.
    // A learner who imported Gravity and went straight to their actor found
    // "Affected by Gravity" missing from `use trait` until they went back and
    // told the world as well — a second place to say what holding the file
    // already said.
    const rules = projectWorldRules({
      'rules/gravity.rule': ruleFile('Gravity'),
      'rules/wind.rule': ruleFile('Wind'),
      'worlds/a.world': JSON.stringify({
        blocks: {blocks: [{type: 'world_world'}]}, // names nothing at all
      }),
    });

    expect(new Set(rules)).toEqual(
      new Set([...FOUNDATION_RULE_NAMES, 'Gravity', 'Wind']),
    );
  });

  it('ignores a rule a world names but the project has not got', () => {
    // The other direction, and the one that used to produce a trait dropdown
    // offering things nothing could provide: a `use rule` block left behind by
    // a deleted file is now a row about nothing, rather than a claim.
    const rules = projectWorldRules({
      'worlds/a.world': JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_world',
              next: {block: {type: 'world_use_rule', fields: {RULE: 'Wind'}}},
            },
          ],
        },
      }),
    });

    expect(new Set(rules)).toEqual(new Set(FOUNDATION_RULE_NAMES));
  });

  it('lists the foundation, which has no file to hold', () => {
    // A world runs on Space and Appearance whether or not it says so
    // (`WorldBuilder.rulesInPlay`). The trait dropdown reads this list, so
    // leaving them out would hide traits every actor actually has.
    expect(new Set(projectWorldRules({}))).toEqual(
      new Set(FOUNDATION_RULE_NAMES),
    );
  });

  it('names a `.js` rule by what it can be named by', () => {
    // Everything downstream keys on names, and a hand-written rule has none of
    // its own. A shim re-exporting a built-in IS that built-in and resolves to
    // its name; a rule genuinely the project's own has nothing static to read,
    // so it answers to its module — which is what every other reference to one
    // does, and what says truthfully that it is in play and cannot be read.
    const rules = projectWorldRules({
      'rules/animation.js': `export {AnimationRule as default} from 'world-lab';\n`,
      'rules/mine.js': `const rule = new RuleBuilder({id: 'mine', name: 'Mine'});\nexport default rule.build();`,
    });

    expect(new Set(rules)).toEqual(
      // The shim resolves to "Appearance", which is foundational anyway.
      new Set([...FOUNDATION_RULE_NAMES, 'rules/mine']),
    );
  });

  it('names a `.rule` by the name it declares, not by its file', () => {
    // Which is the whole reason a reference is a name: the file can be renamed
    // or moved and the rule is still the same rule.
    expect(
      new Set(projectWorldRules({'rules/anything.rule': ruleFile('Wind')})),
    ).toEqual(new Set([...FOUNDATION_RULE_NAMES, 'Wind']));
  });
});

// `.effect` files: what the `add effect` dropdown lists, and the knobs the
// block grows a socket for.
const EFFECT_FILES = {
  'effects/ripple.effect': JSON.stringify({
    version: 1,
    name: 'Ripple',
    parameters: [
      {id: 'strength', name: 'strength', type: 'float', defaultValue: 0.02},
      {id: 'color', name: 'tint', type: 'vec3', defaultValue: [1, 0, 0]},
    ],
    nodes: [],
    edges: [],
    functions: [],
  }),
  'effects/plain.effect': JSON.stringify({
    version: 1,
    name: 'Plain',
    parameters: [],
    nodes: [],
    edges: [],
    functions: [],
  }),
  // Mid-edit: the editor writes on every change, and a learner can also open
  // the file as text.
  'effects/broken.effect': '{"name": "Broken", "parameters"',
  // Not under effects/, so not an effect.
  'actors/player.actor': '{}',
};

describe('projectEffectFileOptions', () => {
  it('labels each effect by its authored name, valued by module path', () => {
    expect(new Set(projectEffectFileOptions(EFFECT_FILES))).toEqual(
      new Set([
        ['Ripple', 'effects/ripple'],
        ['Plain', 'effects/plain'],
        // Unparseable: falls back to the file stem rather than disappearing.
        ['Broken', 'effects/broken'],
      ]),
    );
  });
});

describe('projectEffectParameters', () => {
  it('reads the declared parameters, keyed by module path', () => {
    const parameters = projectEffectParameters(EFFECT_FILES);
    expect(parameters['effects/ripple'].map(p => p.id)).toEqual([
      'strength',
      'color',
    ]);
    expect(parameters['effects/ripple'][0]).toMatchObject({
      name: 'strength',
      type: 'float',
      defaultValue: 0.02,
    });
  });

  it('gives an effect with no parameters an empty list', () => {
    expect(projectEffectParameters(EFFECT_FILES)['effects/plain']).toEqual([]);
  });

  it('gives an unparseable effect an empty list rather than throwing', () => {
    // The block then shows the effect with no knobs, which is recoverable; a
    // throw here would take the whole dropdown refresh down with it.
    expect(projectEffectParameters(EFFECT_FILES)['effects/broken']).toEqual([]);
  });

  it('ignores files outside effects/', () => {
    expect(projectEffectParameters(EFFECT_FILES)).not.toHaveProperty(
      'actors/player',
    );
  });

  it('drops entries that are not shaped like a parameter', () => {
    const files = {
      'effects/odd.effect': JSON.stringify({
        parameters: [
          {id: 'ok', type: 'float', name: 'ok', defaultValue: 0},
          7,
          {name: 'no id'},
        ],
      }),
    };
    expect(
      projectEffectParameters(files)['effects/odd'].map(p => p.id),
    ).toEqual(['ok']);
  });
});

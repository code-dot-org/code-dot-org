import {describe, expect, it} from 'vitest';

import {
  projectActorOptions,
  projectAnimationFileOptions,
  projectMapActorTypes,
  projectRuleOptions,
  projectWorldOptions,
  projectWorldRules,
} from '../projectModules';

const FILES = {
  'scenes/main.scene': '{}',
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
    expect(paths).not.toContain('scenes/main');
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
  // A `.world` is a Blockly workspace: a `world_world` root that chains
  // `world_use_rule` blocks (each with a RULE field) below it via `next`.
  const worldFile = (...rules: string[]) => {
    const chain = rules.reduceRight<object | undefined>(
      (next, rule) => ({
        type: 'world_use_rule',
        fields: {RULE: rule},
        ...(next ? {next: {block: next}} : {}),
      }),
      undefined,
    );
    return JSON.stringify({
      blocks: {
        blocks: [{type: 'world_world', next: {block: chain}}],
      },
    });
  };

  it('collects the RULE of every use-rule block, deduped across worlds', () => {
    const rules = projectWorldRules({
      'worlds/a.world': worldFile('GravityRule', 'InputRule'),
      'worlds/b.world': worldFile('InputRule', 'AnimationRule'), // Input deduped
      'scenes/main.scene': worldFile('CollisionRule'), // not a .world — ignored
      'worlds/broken.world': 'not json yet', // mid-edit — skipped
    });
    expect(new Set(rules)).toEqual(
      new Set(['GravityRule', 'InputRule', 'AnimationRule']),
    );
  });

  it('resolves a project rule shim (path) to the built-in it re-exports', () => {
    const rules = projectWorldRules({
      'worlds/a.world': worldFile('rules/gravity', 'rules/mine', 'InputRule'),
      'rules/gravity.js': `export {GravityRule as default} from 'world-lab';\n`,
      // A genuinely project-defined rule (no built-in re-export) → no trait
      // contribution yet, so it resolves to nothing.
      'rules/mine.js': `const rule = new RuleBuilder({id: 'mine', name: 'Mine'});\nexport default rule.build();`,
    });
    // The gravity shim resolves to GravityRule; the built-in passes through; the
    // real project rule contributes no built-in trait name.
    expect(new Set(rules)).toEqual(new Set(['GravityRule', 'InputRule']));
  });
});

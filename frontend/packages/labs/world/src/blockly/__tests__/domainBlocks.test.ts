import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS, DOMAIN_TOOLBOX} from '../domainBlocks';

// The domain blocks each carry a `world-lab` JavaScript generator. These test
// them in isolation with fake `block`/`generator` objects — no rendered Blockly
// workspace — locking the exact code each block emits. The assembly that orders
// them into a module is covered by assembleActorModule.test.ts.

const generatorFor = (type: string) => {
  const block = DOMAIN_BLOCKS.find(b => b.type === type);
  if (!block) {
    throw new Error(`no domain block '${type}'`);
  }
  return block.generator.javascript;
};

/**
 * Run a block's generator with fake field values and statement bodies. The real
 * `block`/`generator`/`environment` are a rendered Blockly workspace's; these
 * blocks only read fields and `statementToCode`, so canned stand-ins suffice.
 */
const emit = (
  type: string,
  fields: Record<string, string | number>,
  statements: Record<string, string> = {},
  values: Record<string, string> = {},
): string => {
  const block = {getFieldValue: (name: string) => fields[name]};
  const generator = {
    statementToCode: (_block: unknown, name: string) => statements[name] ?? '',
    valueToCode: (_block: unknown, name: string) => values[name] ?? '',
  };
  return generatorFor(type)(
    block as never,
    generator as never,
    {} as never,
  ) as string;
};

describe('domain block generators', () => {
  it('world_actor builds the actor and its body, without the export', () => {
    const code = emit(
      'world_actor',
      {ID: 'player', NAME: 'Player'},
      {BODY: 'actor.useTraits([X]);\n'},
    );
    expect(code).toContain(`import * as WorldLab from 'world-lab';`);
    expect(code).toContain(
      `const actor = new WorldLab.ActorBuilder({id: "player", name: "Player"});`,
    );
    expect(code).toContain('actor.useTraits([X]);');
    // The export is the assembly's job, not this block's.
    expect(code).not.toContain('export default');
  });

  it('world_use_trait maps the dropdown to a trait', () => {
    expect(emit('world_use_trait', {TRAIT: 'affected'})).toBe(
      'actor.useTraits([WorldLab.AffectedByGravityTrait]);\n',
    );
    expect(emit('world_use_trait', {TRAIT: 'ground'})).toBe(
      'actor.useTraits([WorldLab.GroundTrait]);\n',
    );
    expect(emit('world_use_trait', {TRAIT: 'controlled'})).toBe(
      'actor.useTraits([WorldLab.ControlledByArrowsTrait]);\n',
    );
  });

  it('world_set_position sets a Vector from the numeric fields', () => {
    expect(emit('world_set_position', {X: 200, Y: 20})).toBe(
      'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(200, 20));\n',
    );
  });

  it('world_set_sprite elects the appearance trait and sets the sprite', () => {
    expect(emit('world_set_sprite', {SPRITE: 'player'})).toBe(
      'actor.useTraits([WorldLab.AppearanceTrait]);\n' +
        'actor.set(WorldLab.SpriteProperty, "player");\n',
    );
  });

  it('world_play_animation elects the appearance trait and sets the animation', () => {
    expect(emit('world_play_animation', {ANIMATION: 'coinSpin'})).toBe(
      'actor.useTraits([WorldLab.AppearanceTrait]);\n' +
        'actor.set(WorldLab.AnimationProperty, "coinSpin");\n',
    );
  });

  it('world_on_event registers a handler binding the event value', () => {
    expect(
      emit(
        'world_on_event',
        {EVENT: 'startsFalling'},
        {HANDLER: 'console.log("hi");\n'},
      ),
    ).toBe(
      'actor.on(WorldLab.StartsFallingEvent, (_world, _actor, eventValue) => {\n' +
        'console.log("hi");\n});\n',
    );
  });

  it('world_on_event handles the frameChanged event', () => {
    expect(
      emit(
        'world_on_event',
        {EVENT: 'frameChanged'},
        {HANDLER: 'console.log(eventValue);\n'},
      ),
    ).toBe(
      'actor.on(WorldLab.FrameChangedEvent, (_world, _actor, eventValue) => {\n' +
        'console.log(eventValue);\n});\n',
    );
  });

  it('world_log prints the text field', () => {
    expect(emit('world_log', {TEXT: 'Player landed!'})).toBe(
      'console.log("Player landed!");\n',
    );
  });

  it('world_print logs a value input', () => {
    expect(emit('world_print', {}, {}, {VALUE: 'eventValue'})).toBe(
      'console.log(eventValue);\n',
    );
    // No value connected → prints an empty string, not `undefined`.
    expect(emit('world_print', {})).toBe("console.log('');\n");
  });

  it('world_event_value yields the handler event value as an expression', () => {
    const result = generatorFor('world_event_value')(
      {} as never,
      {} as never,
      {} as never,
    );
    expect(Array.isArray(result) && result[0]).toBe('eventValue');
  });

  it('offers the standard logic/math/text blocks in the toolbox', () => {
    const toolboxTypes = (DOMAIN_TOOLBOX as Array<{blocks: string[]}>).flatMap(
      c => c.blocks,
    );
    for (const t of ['controls_if', 'logic_compare', 'math_number', 'text']) {
      expect(toolboxTypes).toContain(t);
    }
  });
});

describe('scene block generators', () => {
  // The scene blocks read block.id and register imports on generator.definitions_
  // (which Blockly's finish() hoists), so they need richer fakes than `emit`.
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
  ) =>
    generatorFor(type)(
      {getFieldValue: (n: string) => block[n], id: block.id} as never,
      {
        definitions_: definitions,
        statementToCode: () => body,
      } as never,
      {} as never,
    ) as string;

  it('world_scene builds the scene, imports the world, and hosts the body', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_scene',
      {ID: 'game', NAME: 'Game', WORLD: 'worlds/platform'},
      defs,
      '{ /* add */ }\n',
    );
    expect(code).toContain(
      'const scene = new WorldLab.SceneBuilder({id: "game", name: "Game"});',
    );
    expect(code).toContain('scene.useWorld(Platform);');
    expect(code).toContain('{ /* add */ }');
    expect(defs['world_lab']).toBe(`import * as WorldLab from 'world-lab';`);
    expect(defs['mod:worlds/platform']).toBe(
      'import Platform from "worlds/platform";',
    );
  });

  it('world_add_actor block-scopes the instance, using the block id as its id', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_actor',
      {ACTOR: 'actors/coin', id: 'add-coin'},
      defs,
      'actor.set(X);\n',
    );
    expect(code).toBe(
      '{\nconst actor = scene.addActor(Coin, "add-coin");\nactor.set(X);\n}\n',
    );
    expect(defs['mod:actors/coin']).toBe('import Coin from "actors/coin";');
  });
});

import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';

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
): string => {
  const block = {getFieldValue: (name: string) => fields[name]};
  const generator = {
    statementToCode: (_block: unknown, name: string) => statements[name] ?? '',
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

  it('world_on_event registers a handler with the mapped event', () => {
    expect(
      emit(
        'world_on_event',
        {EVENT: 'startsFalling'},
        {HANDLER: 'console.log("hi");\n'},
      ),
    ).toBe(
      'actor.on(WorldLab.StartsFallingEvent, () => {\nconsole.log("hi");\n});\n',
    );
  });

  it('world_log prints the text field', () => {
    expect(emit('world_log', {TEXT: 'Player landed!'})).toBe(
      'console.log("Player landed!");\n',
    );
  });
});

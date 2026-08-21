import {installAllBlocks} from '@blockly/field-colour';
import {afterEach, describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {ACTOR_INPUT_EXTENSION} from '../actorInput';
import {COLOUR_CHECK} from '../colorCheck';
import {installColorMessages} from '../colorMessages';
import {
  buildDomainPalette,
  DOMAIN_BLOCKS,
  DOMAIN_TOOLBOX,
  ROOT_BLOCK_TYPES,
} from '../domainBlocks';
import {
  BUILDER_WORLD_EXTENSION,
  RUNTIME_ACTOR_EXTENSION,
  TRAIT_CONTEXT_EXTENSION,
} from '../extensions/actorContext';
import {paramSockets} from '../extensions/effectParamsMutator';
import {RGBA_PREVIEW_EXTENSION} from '../extensions/rgbaPreview';
import {WORLD_CONTEXT_EXTENSION} from '../extensions/worldContext';
import {
  setProjectAnimationFiles,
  setProjectMaps,
  setProjectRuleModules,
} from '../moduleOptions';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {forgetImageSizes, setProjectGrids} from '../spriteCells';
import {shadowFor, shadowsFor, VALUE_SHADOW_EXTENSION} from '../valueShadow';

// The domain blocks each carry a `world-lab` JavaScript generator. These test
// them in isolation with fake `block`/`generator` objects — no rendered Blockly
// workspace — locking the exact code each block emits. The assembly that orders
// them into a module is covered by assembleActorModule.test.ts.

/**
 * A project rule with the members no BUILT-IN rule has any more.
 *
 * Gravity used to be the worked example for world-scoped properties, a world
 * action and an actor query; it is a stock `.rule` now (`src/rules/stock`), and
 * no engine rule declares a world property or action. So the generators for
 * those are exercised against a project rule — which is the only kind that has
 * them, and therefore the honest subject.
 */
const PROJECT_RULE = parseRuleMeta(
  'rules/wind',
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_rule',
          fields: {NAME: 'Has Wind'},
          next: {
            block: {
              type: 'world_rule_property',
              fields: {TYPE: 'number', NAME: 'strength', DEFAULT: '900'},
              next: {
                block: {
                  type: 'world_rule_property',
                  fields: {TYPE: 'vector', NAME: 'direction', DEFAULT: '0,1'},
                  next: {
                    block: {
                      type: 'world_rule_block',
                      fields: {RETURNS: 'none'},
                      extraState: {
                        parts: [{kind: 'label', text: 'Invert'}],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // A trait is a TOP BLOCK beside the rule, with its members chained
        // below it — not a `do` mouth nested inside the rule.
        {
          type: 'world_rule_trait',
          fields: {NAME: 'Windblown'},
          next: {
            block: {
              type: 'world_rule_block',
              fields: {RETURNS: 'boolean'},
              extraState: {
                parts: [{kind: 'label', text: 'is gusting'}],
              },
              next: {
                block: {
                  type: 'world_rule_event',
                  extraState: {parts: [{kind: 'label', text: 'gusted'}]},
                },
              },
            },
          },
        },
      ],
    },
  }),
)!;

// A stored reference names "Has Wind", so this is the project that has one:
// registered as the editor registers a project's parsed `.rule` files, and the
// only thing that can say which module the name means.
registerProjectRules([PROJECT_RULE]);

/** The palette that project rule contributes, built once. */
const PROJECT_BLOCKS = buildDomainPalette([PROJECT_RULE]);

/** A toolbox category from the project palette. */
const projectCategory = (name: string): string[] =>
  (PROJECT_BLOCKS.toolbox as Array<{name: string; blocks: string[]}>).find(
    c => c.name === name,
  )?.blocks ?? [];

/** `generatorFor`, over the project palette rather than the built-in one. */
const projectGeneratorFor = (type: string) => {
  const block = PROJECT_BLOCKS.blocks.find(b => b.type === type);
  if (!block) {
    throw new Error(`no project block '${type}'`);
  }
  return block.generator.javascript;
};

const emitProject = (
  type: string,
  fields: Record<string, unknown> = {},
  values: Record<string, string> = {},
): string =>
  projectGeneratorFor(type)(
    {getFieldValue: (name: string) => fields[name]} as never,
    {
      valueToCode: (_b: unknown, name: string) => values[name] ?? '',
      definitions_: {} as Record<string, string>,
    } as never,
    {} as never,
  ) as string;

const emitProjectValue = (
  type: string,
  fields: Record<string, unknown> = {},
  values: Record<string, string> = {},
): [string, number] =>
  projectGeneratorFor(type)(
    {getFieldValue: (name: string) => fields[name]} as never,
    {
      valueToCode: (_b: unknown, name: string) => values[name] ?? '',
      definitions_: {} as Record<string, string>,
    } as never,
    {} as never,
  ) as [string, number];

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
  next = '',
): string => {
  // Cap-hat blocks (events) read their body from the next-connected chain via
  // `blockToCode(getNextBlock())`; stand that in with a sentinel + `next` string.
  const nextBlock = next ? {} : null;
  const block = {
    getFieldValue: (name: string) => fields[name],
    getNextBlock: () => nextBlock,
  };
  const generator = {
    // Imports are registered here and hoisted by Blockly's `finish()`, so a
    // block that needs one does not emit it inline (see `world_actor`).
    definitions_: {} as Record<string, string>,
    statementToCode: (_block: unknown, name: string) => statements[name] ?? '',
    valueToCode: (_block: unknown, name: string) => values[name] ?? '',
    blockToCode: (b: unknown) => (b === nextBlock && next ? next : ''),
  };
  return generatorFor(type)(
    block as never,
    generator as never,
    {} as never,
  ) as string;
};

/** Run a value (reporter) block's generator; returns its `[code, order]` tuple. */
const emitValue = (
  type: string,
  // A field value is usually a scalar, but a custom field (the vector field)
  // holds a structured `{x, y}`.
  fields: Record<string, unknown> = {},
  values: Record<string, string> = {},
): [string, number] => {
  const block = {getFieldValue: (name: string) => fields[name]};
  const generator = {
    valueToCode: (_block: unknown, name: string) => values[name] ?? '',
  };
  return generatorFor(type)(
    block as never,
    generator as never,
    {} as never,
  ) as [string, number];
};

describe('domain block generators', () => {
  it('world_actor builds the actor and its body, without the export', () => {
    // The body (traits/behaviors) chains below the actor root, not in a `do`
    // input — so it is fed via `next`.
    const code = emit(
      'world_actor',
      {NAME: 'Player'},
      {},
      {},
      'actor.useTraits([X]);\n',
    );
    // Registered for hoisting, not emitted inline: an effect's color
    // parameter registers the same import, and two inline copies is a
    // duplicate declaration at compile.
    expect(code).not.toContain('import ');
    // The id is derived from the name (spaces → underscores).
    expect(code).toContain(
      `const actor = new WorldLab.ActorBuilder({id: "Player", name: "Player"});`,
    );
    expect(code).toContain('actor.useTraits([X]);');
    // The export is the assembly's job, not this block's.
    expect(code).not.toContain('export default');
  });

  it('world_use_trait references a built-in trait via WorldLab', () => {
    expect(emit('world_use_trait', {TRAIT: 'CollidableTrait'})).toBe(
      'actor.useTraits([WorldLab.CollidableTrait]);\n',
    );
    expect(emit('world_use_trait', {TRAIT: 'ControlledByArrowsTrait'})).toBe(
      'actor.useTraits([WorldLab.ControlledByArrowsTrait]);\n',
    );
  });

  it('an actor’s own `each frame` declares a step on the kind', () => {
    // The behaviour half of an actor's own properties: work a KIND does every
    // frame, with no rule to do it in (ActorBuilder.defineStep).
    const code = generatorFor('world_trait_step')(
      {
        getParent: () => null,
        getFieldValue: (name: string) =>
          name === 'NAME' ? 'follow the mouse' : 'decide',
      } as never,
      {statementToCode: () => '  body;\n'} as never,
      {} as never,
    );

    expect(code).toBe(
      'actor.defineStep("follow_the_mouse", "decide", ' +
        '(actor, world, delta) => {\n  body;\n});\n',
    );
  });

  it('the same block under a trait declares nothing', () => {
    // There it is one of the trait's members: the rule's module is assembled
    // from metadata and the body is pulled out by a pass of its own, so
    // generating here would write it twice.
    const code = generatorFor('world_trait_step')(
      {
        getParent: () => ({type: 'world_rule_trait'}),
        getFieldValue: () => 'x',
      } as never,
      {statementToCode: () => '  body;\n'} as never,
      {} as never,
    );

    expect(code).toBe('');
  });

  it('world_use_trait at "(none)" emits nothing', () => {
    // Reachable in the ordinary way now: an actor in a project whose rules
    // offer nothing electable, since the two traits every actor already has
    // are no longer in the dropdown (blockly/foundation).
    expect(emit('world_use_trait', {TRAIT: ''})).toBe('');
  });

  it('world_use_trait imports a project trait from the rule it names', () => {
    const defs: Record<string, string> = {};
    const code = generatorFor('world_use_trait')(
      {getFieldValue: () => 'Has Wind#WindblownTrait'} as never,
      {definitions_: defs} as never,
      {} as never,
    );
    expect(code).toBe('actor.useTraits([WindblownTrait]);\n');
    expect(defs['named:rules/wind:WindblownTrait']).toBe(
      'import {WindblownTrait} from "rules/wind";',
    );
  });

  it('world_use_trait emits nothing for a rule the project has not got', () => {
    // A dead reference, which is a thing a project can hold now that removing
    // a rule deletes its file. Emitting it would import a module that is not
    // there — `cannot resolve 'rules/gravity' from 'actors/player.actor'` —
    // and stop the WHOLE project compiling over one row in one actor. So the
    // row does nothing, the rest of the game runs, and the block says why
    // (extensions/missingRule).
    const defs: Record<string, string> = {};
    const code = generatorFor('world_use_trait')(
      {getFieldValue: () => 'Ghost#HauntedTrait'} as never,
      {definitions_: defs} as never,
      {} as never,
    );

    expect(code).toBe('');
    expect(defs).toEqual({});
  });

  it('world_set_position reads a Vector from the x/y value sockets', () => {
    // X/Y are value sockets: their code comes from `valueToCode` (a shadow
    // math_number, or a plugged getter/math block). No ACTOR value → `actor`.
    expect(emit('world_set_position', {}, {}, {X: '200', Y: '20'})).toBe(
      'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(200, 20));\n',
    );
    // A getter slotted into X composes into the Vector.
    expect(
      emit(
        'world_set_position',
        {},
        {},
        {X: 'actor.get(WorldLab.PositionProperty).x', Y: '20'},
      ),
    ).toBe(
      'actor.set(WorldLab.PositionProperty, ' +
        'new WorldLab.Vector(actor.get(WorldLab.PositionProperty).x, 20));\n',
    );
    // Empty sockets fall back to the block's defaults (0, 0).
    expect(emit('world_set_position', {}, {}, {})).toBe(
      'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(0, 0));\n',
    );
  });

  it('world_set_position targets the ACTOR value when one is plugged in', () => {
    expect(
      emit('world_set_position', {}, {}, {ACTOR: 'touched', X: '0', Y: '0'}),
    ).toBe(
      'touched.set(WorldLab.PositionProperty, new WorldLab.Vector(0, 0));\n',
    );
  });

  it('world_this_actor yields the principal actor expression', () => {
    const thisActor = generatorFor('world_this_actor')(
      {} as never,
      {} as never,
      {} as never,
    );
    expect(Array.isArray(thisActor) && thisActor[0]).toBe('actor');
  });

  it('variables_get_Actor reads its bound variable name', () => {
    const block = {
      getFieldValue: (name: string) => (name === 'VAR' ? 'id7' : ''),
    };
    const generator = {getVariableName: (id: string) => `v_${id}`};
    const code = generatorFor('variables_get_Actor')(
      block as never,
      generator as never,
      {} as never,
    );
    expect(Array.isArray(code) && code[0]).toBe('v_id7');
  });

  it('world_is_a tests an actor value against a module path', () => {
    // Default (empty ACTOR socket → `this actor`).
    expect(emitValue('world_is_a', {TYPE: 'actors/coin'})[0]).toBe(
      'actor.type === "actors/coin"',
    );
    // A plugged-in actor (e.g. a loop variable) is tested instead.
    expect(
      emitValue('world_is_a', {TYPE: 'actors/coin'}, {ACTOR: 'each'})[0],
    ).toBe('each.type === "actors/coin"');
  });

  it('world_for_each iterates its source and nothing else', () => {
    // The `where` is gone: a loop that wants only some of a list walks a list
    // that is only some of it (specs/ACTOR_LISTS.md).
    const block = {
      getFieldValue: (name: string) => (name === 'VAR' ? 'vid' : ''),
    };
    const generator = {
      getVariableName: (id: string) => (id === 'vid' ? 'each' : id),
      valueToCode: () => '',
      statementToCode: (_b: unknown, name: string) =>
        name === 'DO' ? 'each.set(X, Y);\n' : '',
    };
    const code = generatorFor('world_for_each')(
      block as never,
      generator as never,
      {} as never,
    );
    expect(code).toBe(
      'for (const each of world.actors) {\neach.set(X, Y);\n}\n',
    );
  });

  it('world_any_actors asks whether a value holds any actor at all', () => {
    const [code] = generatorFor('world_any_actors')(
      {getFieldValue: () => ''} as never,
      {
        valueToCode: (_b: unknown, name: string) =>
          name === 'LIST' ? 'coins' : '',
      } as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe('WorldLab.all(coins).length > 0');
  });

  it('world_any_actors seeds `all actors`, not `this actor`', () => {
    // Its socket is a LIST. Seeded with `this actor` it would read "any actors
    // in ⟨this actor⟩" and answer true forever, which is a block that teaches
    // nothing and hides the question it exists to ask.
    expect(shadowsFor('world_any_actors')).toEqual([
      {name: 'LIST', shadow: {type: 'world_all_actors'}},
    ]);
  });

  it('world_layer_parallax sets the factor for the layer it is written in', () => {
    // Not part of `define layer`: a new layer moves with the camera like the
    // game does, and parallax is a thing you go and ask for.
    const run = (parallax: {x: number; y: number}) =>
      generatorFor('world_layer_parallax')(
        {getFieldValue: () => parallax} as never,
        {} as never,
        {} as never,
      ) as string;

    expect(run({x: 0.2, y: 0})).toBe(
      'world.setLayerParallax(new WorldLab.Vector(0.2, 0), "main");\n',
    );
    // Vertical-only, which a fixed list of presets could not have said.
    expect(run({x: 0, y: 0.5})).toBe(
      'world.setLayerParallax(new WorldLab.Vector(0, 0.5), "main");\n',
    );
  });

  it('world_layer_fixed is a separate block, and a word not a number', () => {
    // Its own question: the factor says how much of the camera's motion a layer
    // takes, this says whether it looks at the camera at all. Folding them
    // together left a vector on the block doing nothing whenever the answer was
    // "fixed" — a field that lies about mattering.
    const run = (fixed: string) =>
      generatorFor('world_layer_fixed')(
        {getFieldValue: () => fixed} as never,
        {} as never,
        {} as never,
      ) as string;

    expect(run('fixed')).toBe('world.setLayerFit(true, "main");\n');
    expect(run('follows')).toBe('world.setLayerFit(false, "main");\n');
  });

  it('world_move_camera points a named camera at a place', () => {
    const code = generatorFor('world_move_camera')(
      {getFieldValue: () => 'main', workspace: {}} as never,
      {valueToCode: () => 'new WorldLab.Vector(64, 0)'} as never,
      {} as never,
    ) as string;

    expect(code).toBe(
      'world.setCameraPosition(new WorldLab.Vector(64, 0), "main");\n',
    );
  });

  it('world_define_camera collects the traits in its body', () => {
    // An actor's `use trait` calls a builder method; a camera is made in one
    // call and has no half-built form to add to. So the declaration gathers
    // its body rather than each block emitting for itself.
    const use = (trait: string) => ({
      type: 'world_use_trait',
      getFieldValue: () => trait,
      getNextBlock: () => null,
    });
    const code = generatorFor('world_define_camera')(
      {
        id: 'cam1',
        getFieldValue: (name: string) => (name === 'NAME' ? 'Chase' : null),
        getInputTargetBlock: () => use('Gravity#AffectedByGravityTrait'),
      } as never,
      {definitions_: {}, statementToCode: () => ''} as never,
      {} as never,
    ) as string;

    expect(code).toContain('world.defineCamera({id: "camera_cam1"');
    expect(code).toContain('traits: [');
  });

  it('world_define_camera says nothing about traits when it has none', () => {
    const code = generatorFor('world_define_camera')(
      {
        id: 'cam1',
        getFieldValue: (name: string) => (name === 'NAME' ? 'Chase' : null),
        getInputTargetBlock: () => null,
      } as never,
      {definitions_: {}, statementToCode: () => ''} as never,
      {} as never,
    ) as string;

    expect(code).toBe(
      'world.defineCamera({id: "camera_cam1", name: "Chase"});\n',
    );
  });

  it('world_use_camera cuts the view to another camera', () => {
    // Which camera draws is a value, not structure: it moves a transform and
    // rebuilds nothing, so a game may cut mid-play without a restart.
    const code = generatorFor('world_use_camera')(
      {getFieldValue: () => 'main', workspace: {}} as never,
      {} as never,
      {} as never,
    ) as string;

    expect(code).toBe('world.setActiveCamera("main");\n');
  });

  it('world_define_camera declares one by its own block id', () => {
    // By block id, like a layer and a world's own actors — renaming the camera
    // then breaks nothing that names it.
    const code = generatorFor('world_define_camera')(
      {
        id: 'cam1',
        getFieldValue: () => 'Overview',
        getInputTargetBlock: () => null,
      } as never,
      {statementToCode: () => ''} as never,
      {} as never,
    ) as string;

    expect(code).toBe(
      'world.defineCamera({id: "camera_cam1", name: "Overview"});\n',
    );
  });

  it('world_define_camera makes what else is in its body, with it bound', () => {
    // The mouth used to keep the `use trait` rows and drop everything else on
    // the floor — `set actor to follow …`, a `log`, anything — so the blocks
    // sat there looking right and generated nothing at all.
    //
    // Made AFTER the camera and with it bound, so `this camera` inside the
    // definition means the one being defined rather than making a learner
    // repeat its name.
    const code = generatorFor('world_define_camera')(
      {
        id: 'cam1',
        getFieldValue: (name: string) => (name === 'NAME' ? 'Chase' : null),
        getInputTargetBlock: () => null,
      } as never,
      {
        definitions_: {},
        statementToCode: () =>
          'camera.set(WorldLab.ActorToFollowProperty, world.actors.ofType("actors/player"));\n',
      } as never,
      {} as never,
    ) as string;

    expect(code).toContain('world.defineCamera({id: "camera_cam1"');
    expect(code).toContain('const camera = world.camera("camera_cam1");');
    expect(code).toContain('camera.set(WorldLab.ActorToFollowProperty');
    // The camera exists before anything is set on it.
    expect(code.indexOf('defineCamera')).toBeLessThan(
      code.indexOf('world.camera('),
    );
  });

  it('gives a camera trait’s property a socket, not the world', () => {
    // The bug a hand-authored camera-follow rule hit. A camera-scoped property
    // is a SUBJECT property like an actor's — it belongs to whatever elected
    // the trait — so its blocks take a socket saying which. Testing for
    // `scope === 'actor'` sent it down the world-scoped path, and the game
    // died looking for a slot the world never had.
    const followRule = parseRuleMeta(
      'rules/follow',
      JSON.stringify({
        blocks: {
          languageVersion: 0,
          blocks: [
            {type: 'world_rule', fields: {NAME: 'Camera Follow'}},
            {
              type: 'world_rule_trait',
              fields: {NAME: 'Follows', SUBJECT: 'camera'},
              next: {
                block: {
                  type: 'world_rule_property',
                  fields: {
                    TYPE: 'actors',
                    ACCESS: 'writable',
                    NAME: 'actor to follow',
                  },
                },
              },
            },
          ],
        },
      }),
    )!;
    const palette = buildDomainPalette([followRule]);
    const block = (type: string) =>
      palette.blocks.find(b => b.type === type) as
        | {message0: string; args0?: Array<{type: string; name: string}>}
        | undefined;

    // Keyed by the RULE's name, like every other generated member.
    const getter = block('world_get_CameraFollow_ActorToFollowProperty');
    const setter = block('world_set_CameraFollow_ActorToFollowProperty');

    // Reads as a question about one camera, and takes one.
    expect(getter?.message0).toBe('get actor to follow of %1');
    expect(getter?.args0?.[0]).toMatchObject({
      type: 'input_value',
      name: 'ACTOR',
    });
    expect(setter?.message0).toContain('set actor to follow of %1');
  });

  it('world_camera names the one a world means', () => {
    // A world body knows which camera it is wiring up; a rule does not, and
    // uses `all cameras` instead. Actor-typed, so the property setters a camera
    // TRAIT brings take it without knowing what it is.
    const [code] = generatorFor('world_camera')(
      {getFieldValue: () => 'main', workspace: {}} as never,
      {} as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe('world.camera("main")');
  });

  it('world_all_cameras is how a rule reaches a camera at all', () => {
    // Actor-typed on purpose: `for each actor ⟨c⟩ in ⟨all cameras⟩ where ⟨…⟩`
    // then `set position of ⟨c⟩` is built entirely from blocks that already
    // existed. A dropdown cannot say "whichever cameras have this trait".
    const [code] = generatorFor('world_all_cameras')(
      {} as never,
      {} as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe('[...world.cameras]');
  });

  it('world_all_actors_in_layer narrows the source to one layer', () => {
    const [code] = generatorFor('world_all_actors_in_layer')(
      {getFieldValue: () => 'main', workspace: {}} as never,
      {} as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe('world.actors.inLayer("main")');
  });

  it('world_is_in_layer asks the same question of one actor', () => {
    // A value over several actors reads the first, as every value does.
    const [code] = generatorFor('world_is_in_layer')(
      {getFieldValue: () => 'main', workspace: {}} as never,
      {valueToCode: () => 'touched'} as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe('touched.layer === "main"');
  });

  it('world_filter_actors is the loop’s question with the loop taken off', () => {
    // Same variable, same source, same predicate as `world_for_each` above.
    // What differs is that this hands the actors back instead of running a
    // body, which is what let the loop drop its `where` (specs/ACTOR_LISTS.md).
    const block = {
      getFieldValue: (name: string) => (name === 'VAR' ? 'vid' : ''),
    };
    const generator = {
      getVariableName: (id: string) => (id === 'vid' ? 'each' : id),
      valueToCode: (_b: unknown, name: string) =>
        name === 'WHERE' ? 'each.type === "actors/coin"' : '',
    };

    const [code] = generatorFor('world_filter_actors')(
      block as never,
      generator as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe(
      'WorldLab.filtered(world.actors, each => each.type === "actors/coin")',
    );
  });

  it('world_first_actor takes the first of whatever it is given', () => {
    const [code] = generatorFor('world_first_actor')(
      {getFieldValue: () => '', getInputTargetBlock: () => null} as never,
      {valueToCode: () => ''} as never,
      {} as never,
    ) as unknown as [string, number];

    // The default source is `all actors`, which is already iterable — the same
    // `actorSource` shortcut the loop takes.
    expect(code).toBe('WorldLab.firstOf(world.actors)');
  });

  it('world_actors_with_trait asks the engine, not a predicate', () => {
    // Ten of the eighteen filtered loops in the stock rules test exactly this,
    // and `ActorCollection.with` has answered it since before there were lists.
    const [code] = emitValue('world_actors_with_trait', {
      TRAIT: 'AffectedByGravityTrait',
    });

    expect(code).toBe('world.actors.with(WorldLab.AffectedByGravityTrait)');
  });

  it('world_actors_with_trait emits no actors when it names nothing', () => {
    // An unfinished block is inert rather than `world.actors.with()`, which
    // throws — the bargain every other dropdown block makes.
    expect(emitValue('world_actors_with_trait', {TRAIT: ''})[0]).toBe('[]');
  });

  it('world_extreme_actor picks one by a key rather than by position', () => {
    const block = {
      getFieldValue: (name: string) =>
        name === 'VAR' ? 'vid' : name === 'END' ? 'least' : '',
    };
    const generator = {
      getVariableName: (id: string) => (id === 'vid' ? 'other' : id),
      valueToCode: (_b: unknown, name: string) =>
        name === 'KEY' ? 'distance(other)' : '',
    };

    const [code] = generatorFor('world_extreme_actor')(
      block as never,
      generator as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe(
      'WorldLab.extreme(world.actors, other => distance(other), false)',
    );
  });

  it('world_extreme_actor turns round for “most”', () => {
    const block = {
      getFieldValue: (name: string) =>
        name === 'VAR' ? 'vid' : name === 'END' ? 'most' : '',
    };
    const generator = {
      getVariableName: () => 'other',
      valueToCode: () => 'size(other)',
    };

    const [code] = generatorFor('world_extreme_actor')(
      block as never,
      generator as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toContain(', true)');
  });

  it('world_ordered_actors sorts by a key, least first by default', () => {
    const block = {
      getFieldValue: (name: string) =>
        name === 'VAR' ? 'vid' : name === 'END' ? 'least' : '',
    };
    const generator = {
      getVariableName: () => 'other',
      valueToCode: () => 'distance(other)',
    };

    const [code] = generatorFor('world_ordered_actors')(
      block as never,
      generator as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe(
      'WorldLab.ordered(world.actors, other => distance(other), false)',
    );
  });

  it('world_take_actors takes the front of a list', () => {
    const block = {getFieldValue: () => '', getInputTargetBlock: () => null};
    const generator = {
      valueToCode: (_b: unknown, name: string) => (name === 'COUNT' ? '3' : ''),
    };

    const [code] = generatorFor('world_take_actors')(
      block as never,
      generator as never,
      {} as never,
    ) as unknown as [string, number];

    expect(code).toBe('WorldLab.taken(world.actors, 3)');
  });

  it('world_set_sprite sets the sprite on the ACTOR value (no trait election)', () => {
    // Default (empty socket → `this actor`) sets it on the current actor. The
    // cell is written every time — an actor that drew one cell and is then set
    // to a picture must stop drawing it — and (0, 0) means the whole image.
    expect(emit('world_set_sprite', {SPRITE: 'player'})).toBe(
      'actor.set(WorldLab.SpriteProperty, "player");\n' +
        'actor.set(WorldLab.SpriteCellOriginProperty, new WorldLab.Vector(0, 0));\n' +
        'actor.set(WorldLab.SpriteCellSizeProperty, new WorldLab.Vector(0, 0));\n',
    );
    // A plugged-in actor (e.g. a loop's touched actor) is set instead.
    expect(
      emit('world_set_sprite', {SPRITE: 'switch'}, {}, {ACTOR: 'touched'}),
    ).toBe(
      'touched.set(WorldLab.SpriteProperty, "switch");\n' +
        'touched.set(WorldLab.SpriteCellOriginProperty, new WorldLab.Vector(0, 0));\n' +
        'touched.set(WorldLab.SpriteCellSizeProperty, new WorldLab.Vector(0, 0));\n',
    );
  });

  it('world_set_sprite resolves a chosen cell to its rectangle', () => {
    // The field names a cell (`coinSpin.png#3`); the RECTANGLE is generated,
    // because the engine is never told about grids (blockly/spriteCells).
    setProjectGrids(
      {'coinSpin.png': {type: 'sheet', cell: {width: 32, height: 32}}},
      {'coinSpin.png': {width: 192, height: 32}},
    );

    expect(emit('world_set_sprite', {SPRITE: 'coinSpin.png#3'})).toBe(
      'actor.set(WorldLab.SpriteProperty, "coinSpin.png");\n' +
        'actor.set(WorldLab.SpriteCellOriginProperty, new WorldLab.Vector(96, 0));\n' +
        'actor.set(WorldLab.SpriteCellSizeProperty, new WorldLab.Vector(32, 32));\n',
    );

    // An index the grid no longer holds draws the whole picture: a visible
    // wrong answer beats a made-up rectangle.
    expect(emit('world_set_sprite', {SPRITE: 'coinSpin.png#99'})).toContain(
      'SpriteCellSizeProperty, new WorldLab.Vector(0, 0)',
    );
    // Both halves: grids are replaced, sizes are MERGED (a measurement arrives
    // late and must not drop the others), so clearing them takes two calls.
    // `world_world` states every measured size, and would state this one.
    setProjectGrids({}, {});
    forgetImageSizes();
  });

  it('world_world states every image the editor measured', () => {
    // No block says this, the same way no block says which animation files
    // exist: how big a picture is is a fact about the project, not a decision
    // a world makes. The engine cannot read a PNG and the editor already has.
    //
    // What needs it: `intrinsic size`, and through it `collision size of` and
    // "Stays in the Map". Without it those only ever had an answer for a
    // SPRITESHEET, whose cells state their own size.
    setProjectGrids({}, {'b.png': {width: 8, height: 8}});
    setProjectGrids({}, {'a.png': {width: 64, height: 16}});

    // Sorted, so the same project compiles to the same text — the order two
    // measurements happened to arrive in is not part of the program.
    expect(emit('world_world', {NAME: 'W'})).toContain(
      'world.useImageSizes({"a.png":{"width":64,"height":16},' +
        '"b.png":{"width":8,"height":8}});\n',
    );

    // Nothing measured, nothing said.
    forgetImageSizes();
    expect(emit('world_world', {NAME: 'W'})).not.toContain('useImageSizes');
  });

  it('world_play_animation plays the animation on the ACTOR value (restarting it)', () => {
    // Default (empty socket → `this actor`) plays it on the current actor.
    expect(emit('world_play_animation', {ANIMATION: 'coinSpin'})).toBe(
      'WorldLab.playAnimation(actor, "coinSpin");\n',
    );
    // A plugged-in actor (e.g. a loop's touched actor) is played instead.
    expect(
      emit(
        'world_play_animation',
        {ANIMATION: 'switch'},
        {},
        {ACTOR: 'touched'},
      ),
    ).toBe('WorldLab.playAnimation(touched, "switch");\n');
  });

  it('per-event blocks wrap the body chained below them (next), by event', () => {
    // Each engine event has its own `world_on_<id>` cap hat; the handler body is
    // the blocks connected below it (the next chain), wrapped in `.on(...)`.
    expect(
      emit(
        'world_on_Appearance_AnimationEndedEvent',
        {},
        {},
        {},
        'console.log("hi");\n',
      ),
    ).toBe(
      'actor.on(WorldLab.AnimationEndedEvent, (world, actor, eventValue) => {\n' +
        'console.log("hi");\n});\n',
    );
    expect(
      emit(
        'world_on_Appearance_FrameChangedEvent',
        {},
        {},
        {},
        'console.log(eventValue);\n',
      ),
    ).toBe(
      'actor.on(WorldLab.FrameChangedEvent, (world, actor, eventValue) => {\n' +
        'console.log(eventValue);\n});\n',
    );
  });

  it('event blocks register the handler on their ACTOR value', () => {
    // Default (empty socket → `this actor` shadow) registers on `actor`; an
    // empty next chain yields an empty handler body.
    expect(emit('world_on_Appearance_AnimationEndedEvent', {}, {}, {})).toBe(
      'actor.on(WorldLab.AnimationEndedEvent, (world, actor, eventValue) => {\n});\n',
    );
    // A plugged-in actor value registers on it instead.
    expect(
      emit('world_on_Appearance_AnimationEndedEvent', {}, {}, {ACTOR: 'other'}),
    ).toBe(
      'other.on(WorldLab.AnimationEndedEvent, (world, actor, eventValue) => {\n});\n',
    );
  });

  it('hands Blockly a generator for every dropdown over project content', () => {
    // Not a snapshot of one. Two reasons, and the second is the one that bit:
    //
    //  • the content changes (a project's rules, files, the events in play), and
    //  • Blockly TRIMS a static array — it factors out any word every label
    //    shares and renders it as a fixed label beside the field. Defined before
    //    a project loads, every event read "Has Appearance ▸ animation …", so
    //    that prefix was stamped onto `emit` for good; every step anchor read
    //    "Has …", so the retired `before`/`after` grew a stray "Has".
    //
    // The phase list is FIXED, so it is not here — it is the same twelve words
    // whatever the project holds, and trimming a shared prefix it does not have
    // costs nothing.
    const live = [
      ['world_use_trait', 'TRAIT'],
      ['world_use_rule', 'RULE'],
      ['world_add_actor', 'ACTOR'],
      ['world_load_map', 'MAP'],
    ] as const;
    for (const [type, field] of live) {
      const args = (
        DOMAIN_BLOCKS.find(b => b.type === type) as {
          args0?: Array<{name?: string; options?: unknown}>;
        }
      ).args0!;
      const arg = args.find(a => a.name === field);
      expect(typeof arg?.options, `${type}.${field}`).toBe('function');
    }
  });

  it('lets an event value sit opposite anything in a comparison', () => {
    // `logic_compare` refuses two operands whose output checks disagree — that
    // is the block's own onchange, not ours — so an `event value` that claimed
    // to be a Number could not be compared against a key, and a saved handler
    // was pulled apart on load. This asks the real predicate the compare block
    // asks: are these two outputs compatible?
    const definition = (type: string) =>
      DOMAIN_BLOCKS.find(b => b.type === type) as {output?: unknown};
    expect(definition('world_event_value').output).toBeNull();

    const workspace = new Blockly.Workspace();
    const checker = workspace.connectionChecker;
    const connection = (check: string | null) => {
      const block = workspace.newBlock('logic_boolean');
      block.setOutput(true, check);
      return block.outputConnection!;
    };
    const eventValue = connection(null);
    for (const other of ['String', 'Number', 'Boolean', 'Actor', 'Vector']) {
      expect(checker.doTypeChecks(eventValue, connection(other))).toBe(true);
    }
  });

  it('a key names itself, for comparing against an event value', () => {
    // The keyboard's events are an authored rule's now, so a handler filters
    // for its key rather than being built around one: `if event value = key
    // ⟨space⟩`. This block is what keeps that from reading as `= " "`.
    expect(emitValue('world_key', {KEY: ' '})[0]).toBe('" "');
    expect(emitValue('world_key', {KEY: 'ArrowLeft'})[0]).toBe('"ArrowLeft"');
  });

  it('the mouse reads like the keyboard, one word along', () => {
    // Every mouse block is a key block with the noun changed, which is the
    // point: a learner who has read one has read both. Only the position has
    // no counterpart — a pointer is somewhere and a key is not.
    expect(emitValue('world_mouse_button', {BUTTON: 'right'})[0]).toBe(
      '"right"',
    );
    expect(emitValue('world_is_button_down', {BUTTON: 'left'})[0]).toBe(
      'world.isButtonDown("left")',
    );
    expect(emitValue('world_mouse_position')[0]).toBe('world.mousePosition()');
  });

  it('loops over the buttons that changed this frame', () => {
    // The frame boundary, which is the one thing about the mouse a rule cannot
    // work out for itself — the same reason the key loop exists.
    const run = (edge: string) =>
      generatorFor('world_for_each_button')(
        {
          getFieldValue: (name: string) => (name === 'EDGE' ? edge : 'vid'),
        } as never,
        {
          getVariableName: () => 'button',
          statementToCode: () => '  body;\n',
        } as never,
        {} as never,
      ) as string;

    expect(run('PRESSED')).toBe(
      'for (const button of world.newlyPressedButtons()) {\n  body;\n}\n',
    );
    expect(run('RELEASED')).toBe(
      'for (const button of world.newlyReleasedButtons()) {\n  body;\n}\n',
    );
  });

  it('reports the scale between a speed and a distance', () => {
    // The Engine block `rules/stock/motion` multiplies by, in both places it
    // turns a rate into a distance.
    expect(emitValue('world_pixels_per_unit')[0]).toBe(
      'WorldLab.PIXELS_PER_UNIT',
    );
  });

  it('a note generates a comment, on one line', () => {
    // The note survives into the running code, which is the point: the same
    // sentence in the editor and in what the project runs.
    expect(emit('world_comment', {TEXT: 'gravity speeds things up'})).toBe(
      '// gravity speeds things up\n',
    );
    // A pasted line break would comment out only the first line.
    expect(emit('world_comment', {TEXT: 'first\nsecond'})).toBe(
      '// first second\n',
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

  it('world_return reports its value (a query body ends in one)', () => {
    expect(
      emit(
        'world_return',
        {},
        {},
        {VALUE: 'actor.get(WorldLab.SpeedProperty)'},
      ),
    ).toBe('return actor.get(WorldLab.SpeedProperty);\n');
    // No value connected → returns `undefined`, not an empty statement.
    expect(emit('world_return', {})).toBe('return undefined;\n');
  });

  it('world_step_delta yields the frame delta (bound in a step closure)', () => {
    expect(emitValue('world_step_delta')[0]).toBe('delta');
  });

  it('world_has_trait tests actor.has(trait)', () => {
    // A built-in trait reads `WorldLab.<Trait>`; the actor comes from its socket.
    expect(
      emitValue(
        'world_has_trait',
        {TRAIT: 'AffectedByGravityTrait'},
        {ACTOR: 'each'},
      )[0],
    ).toBe('each.has(WorldLab.AffectedByGravityTrait)');
    // Empty socket → the principal `actor`.
    expect(emitValue('world_has_trait', {TRAIT: 'GroundTrait'})[0]).toBe(
      'actor.has(WorldLab.GroundTrait)',
    );
  });

  it('world_add_trait / world_remove_trait mutate the subject', () => {
    // The runtime pair beside `has trait`, and the same shape: the trait comes
    // from the dropdown, the subject from the socket, and an empty socket is
    // the principal `actor`. One block serves a template body and a handler,
    // which is why the method names match on ActorBuilder and Actor alike.
    expect(
      emit(
        'world_add_trait',
        {TRAIT: 'AffectedByGravityTrait'},
        {},
        {ACTOR: 'each'},
      ),
    ).toBe('each.addTrait(WorldLab.AffectedByGravityTrait);\n');
    expect(emit('world_remove_trait', {TRAIT: 'GroundTrait'})).toBe(
      'actor.removeTrait(WorldLab.GroundTrait);\n',
    );
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
    const toolboxTypes = (
      DOMAIN_TOOLBOX as Array<{blocks: Array<string | {type?: string}>}>
    )
      .flatMap(c => c.blocks)
      // A spelled-out flyout item names its type in a field, not as the entry.
      .map(item => (typeof item === 'string' ? item : (item.type ?? '')));
    for (const t of ['controls_if', 'logic_compare', 'math_number', 'text']) {
      expect(toolboxTypes).toContain(t);
    }
  });

  it('generated actor-property set blocks set the property on the ACTOR value', () => {
    // The value comes from a socket (`valueToCode`) — a shadow number, or a
    // slotted getter/math block. A number actor property (spatial rotation):
    expect(
      emit('world_set_Space_RotationProperty', {}, {}, {VALUE: '45'}),
    ).toBe('actor.set(WorldLab.RotationProperty, 45);\n');
    // Plugged-in actor value targets it instead.
    expect(
      emit(
        'world_set_Space_RotationProperty',
        {},
        {},
        {ACTOR: 'touched', VALUE: '90'},
      ),
    ).toBe('touched.set(WorldLab.RotationProperty, 90);\n');
    // A getter slotted into the value composes through.
    expect(
      emit(
        'world_set_Space_RotationProperty',
        {},
        {},
        {VALUE: 'actor.get(WorldLab.RotationProperty)'},
      ),
    ).toBe(
      'actor.set(WorldLab.RotationProperty, actor.get(WorldLab.RotationProperty));\n',
    );
    // An empty socket falls back to the property default (rotation 0).
    expect(emit('world_set_Space_RotationProperty', {}, {}, {})).toBe(
      'actor.set(WorldLab.RotationProperty, 0);\n',
    );
    // A point actor property (spatial scale): two number x/y sockets → a Vector.
    expect(
      emit('world_set_Space_ScaleProperty', {}, {}, {X: '2', Y: '3'}),
    ).toBe('actor.set(WorldLab.ScaleProperty, new WorldLab.Vector(2, 3));\n');
  });

  it('generated world-property set blocks set the property on the world', () => {
    // A number world property — no ACTOR input, targets the world. Read off a
    // PROJECT rule: no built-in declares a world property any more.
    expect(
      emitProject(
        `world_set_${'HasWind_'}StrengthProperty`,
        {},
        {VALUE: '500'},
      ),
    ).toBe('world.set(StrengthProperty, 500);\n');
    // Empty socket → the property default (900).
    expect(emitProject(`world_set_${'HasWind_'}StrengthProperty`)).toBe(
      'world.set(StrengthProperty, 900);\n',
    );
    // A vector world property is a single Vector socket — a world_vector
    // literal, or another Vector block, slots straight in.
    expect(
      emitProject(
        `world_set_${'HasWind_'}DirectionProperty`,
        {},
        {
          VALUE: 'new WorldLab.Vector(0, -1)',
        },
      ),
    ).toBe('world.set(DirectionProperty, new WorldLab.Vector(0, -1));\n');
    // Empty socket → the property default (0, 1).
    expect(emitProject(`world_set_${'HasWind_'}DirectionProperty`)).toBe(
      'world.set(DirectionProperty, new WorldLab.Vector(0, 1));\n',
    );
  });

  it('generated actor-property get blocks read the property off the ACTOR value', () => {
    // A number actor property reports the value directly.
    expect(emitValue('world_get_Space_RotationProperty')[0]).toBe(
      'actor.get(WorldLab.RotationProperty)',
    );
    // Plugged-in actor value is read instead.
    expect(
      emitValue('world_get_Space_RotationProperty', {}, {ACTOR: 'touched'})[0],
    ).toBe('touched.get(WorldLab.RotationProperty)');
    // A point actor property reads one axis via the x/y dropdown.
    expect(
      emitValue('world_get_Space_ScaleProperty', {COMPONENT: 'y'})[0],
    ).toBe('actor.get(WorldLab.ScaleProperty).y');
  });

  it('generated world-property get blocks read the property off the world', () => {
    expect(emitProjectValue(`world_get_${'HasWind_'}StrengthProperty`)[0]).toBe(
      'world.get(StrengthProperty)',
    );
    // A vector property reads the whole Vector (no axis dropdown).
    expect(
      emitProjectValue(`world_get_${'HasWind_'}DirectionProperty`)[0],
    ).toBe('world.get(DirectionProperty)');
  });

  it('world_vector builds a Vector literal from its field', () => {
    // The field holds a structured {x, y}; the block emits a Vector.
    expect(emitValue('world_vector', {VECTOR: {x: 3, y: -2}})[0]).toBe(
      'new WorldLab.Vector(3, -2)',
    );
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_vector') as {
      output?: string;
      style?: string;
    };
    expect(block.output).toBe('Vector'); // plugs into vector sockets
    expect(block.style).toBe('location_blocks');
  });

  it('world_vector_component reads one axis of a Vector as a Number', () => {
    expect(
      emitValue('world_vector_component', {COMPONENT: 'y'}, {VEC: 'v'})[0],
    ).toBe('v.y');
    // Empty socket falls back to a zero vector.
    expect(emitValue('world_vector_component', {COMPONENT: 'x'})[0]).toBe(
      'new WorldLab.Vector(0, 0).x',
    );
  });

  it('a vector getter/property outputs a Vector styled as a location', () => {
    const dir = PROJECT_BLOCKS.blocks.find(
      b => b.type === `world_get_${'HasWind_'}DirectionProperty`,
    ) as {output?: string; style?: string};
    expect(dir.output).toBe('Vector');
    expect(dir.style).toBe('location_blocks');
  });

  it('generated world-action blocks run the action on the world', () => {
    // A no-argument world action (gravity Invert) → `world.act(Action)`.
    expect(emitProject(`world_do_${'HasWind_'}InvertAction`)).toBe(
      'world.act(InvertAction);\n',
    );
  });

  it('generated actor-action blocks run the action on the ACTOR value', () => {
    // A number-argument actor action (Rotate to). The argument is a value socket
    // (a shadow number, or a slotted getter/math), and the actor is the `on …`
    // socket (default `this actor`).
    expect(emit('world_do_Space_RotateAction', {}, {}, {VALUE: '45'})).toBe(
      'actor.act(WorldLab.RotateAction, 45);\n',
    );
    // Plugged-in actor value runs it on that actor.
    expect(
      emit(
        'world_do_Space_RotateAction',
        {},
        {},
        {ACTOR: 'touched', VALUE: '90'},
      ),
    ).toBe('touched.act(WorldLab.RotateAction, 90);\n');
    // Empty argument socket falls back to the param default (0 degrees).
    expect(emit('world_do_Space_RotateAction', {}, {}, {})).toBe(
      'actor.act(WorldLab.RotateAction, 0);\n',
    );
    // A vector-argument actor action (Move to) → a Vector argument.
    expect(emit('world_do_Space_MoveAction', {}, {}, {X: '3', Y: '4'})).toBe(
      'actor.act(WorldLab.MoveAction, new WorldLab.Vector(3, 4));\n',
    );
  });

  it('generated query blocks read the query as a boolean reporter', () => {
    // Gravity's "is on the ground?" — reads the ACTOR value (default `this actor`).
    expect(emitProjectValue(`world_query_${'HasWind_'}IsGustingQuery`)[0]).toBe(
      'actor.query(IsGustingQuery)',
    );
    expect(
      emitProjectValue(
        `world_query_${'HasWind_'}IsGustingQuery`,
        {},
        {
          ACTOR: 'touched',
        },
      )[0],
    ).toBe('touched.query(IsGustingQuery)');
    // It is a Boolean reporter styled as logic, so it plugs into `if`/comparisons.
    const block = PROJECT_BLOCKS.blocks.find(
      b => b.type === `world_query_${'HasWind_'}IsGustingQuery`,
    ) as {output?: string; style?: string};
    expect(block.output).toBe('Boolean');
    expect(block.style).toBe('logic_blocks');
  });

  it('registers every world_ block the toolbox references', () => {
    // The rule categories reference generated event types (`world_on_<id>`); this
    // catches any drift between what the toolbox lists and what is registered.
    const registered = new Set(DOMAIN_BLOCKS.map(b => b.type));
    const toolboxTypes = (
      DOMAIN_TOOLBOX as Array<{blocks: Array<string | {type?: string}>}>
    )
      .flatMap(c => c.blocks)
      // A spelled-out flyout item names its type in a field, not as the entry.
      .map(item => (typeof item === 'string' ? item : (item.type ?? '')));
    for (const t of toolboxTypes.filter(t => t.startsWith('world_'))) {
      expect(registered).toContain(t);
    }
    // Each built-in rule's events are surfaced. The keyboard's are not among
    // them any more: they belong to `rules/stock/input`, whose hats the project
    // palette generates (see arrowsRule/inputRule tests).
    for (const t of [
      'world_on_Appearance_AnimationEndedEvent',
      'world_on_Appearance_FrameChangedEvent',
    ]) {
      expect(toolboxTypes).toContain(t);
    }
  });

  it('puts the actor-placing blocks in the World category', () => {
    // There is no Scene category: a world holds both the laws and the actors,
    // so `load map` / `add actor` belong beside the rules they run under.
    const names = (DOMAIN_TOOLBOX as Array<{name: string}>).map(c => c.name);
    expect(names).not.toContain('Scene');
    expect(
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === 'World',
      )?.blocks,
    ).toEqual(
      expect.arrayContaining([
        'world_load_map',
        'world_add_actor',
        // Taking actors out belongs beside putting them in, one or all.
        'world_remove_actor',
        'world_clear_world',
        // The subject a world file's blocks take, and half of "remove every
        // coin" — offered in the category that file is built from.
        'world_actor_kind',
      ]),
    );
  });

  it('surfaces generated property setters in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // Spatial's, which is the only built-in rule left with a settable property
    // a learner writes: motion's velocity went with motion (rules/stock/motion).
    expect(category('Space')).toEqual(
      expect.arrayContaining(['world_set_position']),
    );
    // Gravity gains its world properties and its actor property, set and get.
    expect(projectCategory('Has Wind')).toEqual(
      expect.arrayContaining([
        `world_set_${'HasWind_'}StrengthProperty`,
        `world_get_${'HasWind_'}StrengthProperty`,
        `world_set_${'HasWind_'}DirectionProperty`,
        `world_get_${'HasWind_'}DirectionProperty`,
      ]),
    );
    // Spatial keeps the bespoke set-position and gains scale/rotation/skew.
    expect(category('Space')).toEqual(
      expect.arrayContaining([
        'world_set_position',
        'world_set_Space_ScaleProperty',
        'world_get_Space_ScaleProperty',
        'world_set_Space_RotationProperty',
        'world_get_Space_RotationProperty',
        'world_set_Space_SkewProperty',
        'world_get_Space_SkewProperty',
      ]),
    );
  });

  it('surfaces generated rule-action blocks in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // Gravity's world action, Motion's + Spatial's actor actions.
    expect(projectCategory('Has Wind')).toContain(
      `world_do_${'HasWind_'}InvertAction`,
    );
    // Motion's `apply force` is a project block now (rules/stock/motion), so
    // the built-in categories carry only Spatial's and Animation's actions.
    expect(category('Space')).toContain('world_do_Space_MoveAction');
    expect(category('Space')).toEqual(
      expect.arrayContaining([
        'world_do_Space_MoveAction',
        'world_do_Space_RotateAction',
        'world_do_Space_ScaleAction',
        'world_do_Space_ResizeAction',
      ]),
    );
  });

  it('surfaces generated query reporters in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // A project rule's query gets a block in that rule's own category —
    // collision's "is touching" and "collision size of" are project blocks now,
    // covered by solidRule.test; what is left built in is Motion's.
    expect(projectCategory('Has Wind')).toContain(
      `world_query_${'HasWind_'}IsGustingQuery`,
    );
    void category;
    expect(
      (DOMAIN_TOOLBOX as Array<{blocks: Array<string | {type?: string}>}>)
        .flatMap(c => c.blocks)
        // An entry may be a whole flyout item rather than a bare type — the
        // random block spells out the shadows in its sockets — so read the
        // type off either shape.
        .map(item => (typeof item === 'string' ? item : (item.type ?? '')))
        .filter(t => t.startsWith('world_query_')),
    ).toEqual([
      // Motion's "position before" went with motion, as collision's went with
      // collision — a query a rule offers belongs in that rule's category.
      //
      // Space's is the one that stayed, because Space is the foundation and no
      // world elects it: the map's edges are not something an actor opts into
      // having a relationship with. `is outside the map` is the ask-anytime
      // half of the pair; `when ⟨actor⟩ leaves the map` is the other.
      'world_query_Space_OutsideMapQuery',
    ]);
  });
});

describe('how many of a kind', () => {
  it('counts one kind in a list of actors', () => {
    // The question a game asks — how many coins the player has, how many bricks
    // are left — where `how many actors in ⟨…⟩` only answers "how many of
    // anything". The general form would be a filter block and a bound variable
    // to ask one short question.
    expect(
      emitValue(
        'world_count_of_kind',
        {TYPE: 'actors/coin'},
        {LIST: 'held'},
      )[0],
    ).toBe(
      'WorldLab.all(held).filter(each => each.type === "actors/coin").length',
    );
  });

  it('compares kinds the way `is a` does', () => {
    // Both resolve the dropdown to a module path and compare it to `.type`. Two
    // notions of what a kind is would mean `how many ⟨Coin⟩` and `is a ⟨Coin⟩`
    // disagreeing about the same coin.
    const counted = emitValue(
      'world_count_of_kind',
      {TYPE: 'actors/coin'},
      {LIST: 'held'},
    )[0];
    const tested = emitValue(
      'world_is_a',
      {TYPE: 'actors/coin'},
      {ACTOR: 'who'},
    )[0];

    expect(counted).toContain('.type === "actors/coin"');
    expect(tested).toContain('.type === "actors/coin"');
  });

  it('is offered beside the count it narrows', () => {
    const actors =
      (
        DOMAIN_TOOLBOX as Array<{
          name: string;
          blocks: Array<string | {type?: string}>;
        }>
      )
        .find(category => category.name === 'Actor')
        ?.blocks.map(item =>
          typeof item === 'string' ? item : (item.type ?? ''),
        ) ?? [];

    expect(actors).toContain('world_count_of_kind');
    expect(actors.indexOf('world_count_of_kind')).toBe(
      actors.indexOf('world_count_actors') + 1,
    );
  });
});

describe('the map edges', () => {
  const spaceBlocks = () =>
    (
      DOMAIN_TOOLBOX as Array<{
        name: string;
        blocks: Array<string | {type?: string}>;
      }>
    )
      .find(category => category.name === 'Space')
      ?.blocks.map(item =>
        typeof item === 'string' ? item : (item.type ?? ''),
      ) ?? [];

  it('offers both ways of asking, in the foundation', () => {
    // One question, asked two ways because a game asks it two ways: a brick
    // game wants the moment the ball goes past the paddle, a shooter wants to
    // sweep its bullets and drop the ones that are gone. In Space rather than a
    // rule of their own — the map's edges are not something an actor elects to
    // have a relationship with.
    expect(spaceBlocks()).toContain('world_query_Space_OutsideMapQuery');
    expect(spaceBlocks()).toContain('world_on_Space_LeftMapEvent');
  });

  it('registers the hat on the actor it is about', () => {
    // The runtime half: `X.on(event, handler)`, the same shape every actor hat
    // uses. Nothing else in the suite exercises Space's, and an event that is
    // raised into a registration that never happened looks exactly like an
    // event that is never raised.
    expect(
      emit('world_on_Space_LeftMapEvent', {}, {}, {ACTOR: 'target'}, 'body;\n'),
    ).toContain('.on(WorldLab.LeftMapEvent');
  });

  it('asks the actor, not the world', () => {
    // A trait's query is asked OF a subject: `⟨this actor⟩ is outside the map`.
    expect(
      emitValue('world_query_Space_OutsideMapQuery', {}, {ACTOR: 'who'})[0],
    ).toContain('.query(WorldLab.OutsideMapQuery)');
  });

  it('reads as a sentence either way', () => {
    const message = (type: string) =>
      (DOMAIN_BLOCKS as Array<{type: string; message0?: string}>).find(
        block => block.type === type,
      )?.message0;

    expect(message('world_query_Space_OutsideMapQuery')).toBe(
      '%1 is outside the map',
    );
    expect(message('world_on_Space_LeftMapEvent')).toBe(
      'when %1 leaves the map',
    );
  });
});

describe('the two time blocks', () => {
  const inCategory = (name: string, type: string) =>
    (
      DOMAIN_TOOLBOX as Array<{
        name: string;
        blocks: Array<string | {type?: string}>;
      }>
    )
      .find(category => category.name === name)
      ?.blocks.some(
        item => (typeof item === 'string' ? item : item.type) === type,
      ) ?? false;

  it('asks the world for the time rather than reading a clock', () => {
    // `world.time()` is the sum of the deltas the world was ticked by, so it
    // agrees exactly with anything integrated from `delta` and stops while the
    // game is paused. A `Date.now()` here would do neither.
    const code = generatorFor('world_time')(
      {} as never,
      {} as never,
      {} as never,
    ) as [string, number];

    expect(code[0]).toBe('world.time()');
  });

  it('asks the actor its own age', () => {
    // Not `world.time() - something the learner stored`: an age needs no
    // property to keep a birthday in, which is the whole reason a bullet can
    // expire without a trait of its own.
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_actor_age');

    expect(block?.output).toBe('Number');
    expect(block?.args0).toContainEqual(
      expect.objectContaining({name: 'ACTOR', check: 'Actor'}),
    );
  });

  it('defaults the age block to the actor asking', () => {
    // `age of ⟨this actor⟩` is the form a bullet's own step uses, so it is what
    // the block arrives holding — the same shadow every actor-scoped reporter
    // carries.
    const names = (
      DOMAIN_BLOCKS.find(b => b.type === 'world_actor_age')?.extensions ?? []
    ).map(extension =>
      typeof extension === 'string' ? extension : extension.name,
    );

    expect(names).toContain(ACTOR_INPUT_EXTENSION);
  });

  it('files each where its subject is', () => {
    // The clock is a fact about the world; an age is a fact about an actor.
    // Filing the age under World would put it beside `map size`, which is the
    // one place a learner is not looking for something about a bullet.
    expect(inCategory('World', 'world_time')).toBe(true);
    expect(inCategory('Actor', 'world_actor_age')).toBe(true);
  });

  it('keeps `delta` where it was, in Rule', () => {
    // Time and delta are different questions: `delta` is only meaningful inside
    // a step and generates a bare parameter name, where `time` is a call on the
    // world and works in an event handler or a query.
    expect(inCategory('Rule', 'world_step_delta')).toBe(true);
    expect(inCategory('World', 'world_step_delta')).toBe(false);
  });
});

describe('the two random blocks', () => {
  const mathCategory = () =>
    (
      DOMAIN_TOOLBOX as Array<{
        name: string;
        blocks: Array<string | {type?: string; inputs?: unknown}>;
      }>
    ).find(category => category.name === 'Math')?.blocks ?? [];

  const entry = (type: string) =>
    mathCategory().find(
      item => (typeof item === 'string' ? item : item.type) === type,
    );

  it('both live under Math, where a learner looks for a random', () => {
    expect(entry('math_random_int')).toBeDefined();
    expect(entry('world_random_place')).toBeDefined();
  });

  it('gives the core random block filled sockets', () => {
    // Blockly's stock toolbox seeds these in XML we do not use, and our own
    // `valueShadowExtension` never runs on a block we did not define. Without
    // them the block reads `random integer from ⟨⟩ to ⟨⟩` and generates
    // `mathRandomInt(0, 0)` — always 0, and nothing says so.
    expect(entry('math_random_int')).toEqual({
      kind: 'block',
      type: 'math_random_int',
      inputs: {
        FROM: {shadow: {type: 'math_number', fields: {NUM: 1}}},
        TO: {shadow: {type: 'math_number', fields: {NUM: 100}}},
      },
    });
  });

  it('asks the world for a place rather than doing the arithmetic here', () => {
    // So the same question has one answer: `world.randomPlace()` reads the
    // map's own size, and a project that resizes its map scatters over the new
    // one without touching a block.
    const code = generatorFor('world_random_place')(
      {} as never,
      {} as never,
      {} as never,
    ) as [string, number];

    expect(code[0]).toBe('world.randomPlace()');
  });

  it('reports a Vector, so `x of`/`y of` can take it apart', () => {
    // `set position` wants an x and a y, so this is how it gets there.
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_random_place');

    expect(block?.output).toBe('Vector');
    expect(
      DOMAIN_BLOCKS.find(b => b.type === 'world_vector_component')?.args0,
    ).toContainEqual(expect.objectContaining({name: 'VEC', check: 'Vector'}));
  });

  it('warns when there is no world to ask, like the other world questions', () => {
    // `map size` and `view size` carry the same extension: dragged somewhere
    // with no `world` in scope they say so rather than generating a reference
    // to an undefined name.
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_random_place');
    const names = (block?.extensions ?? []).map(extension =>
      typeof extension === 'string' ? extension : extension.name,
    );

    expect(names).toContain(WORLD_CONTEXT_EXTENSION);
  });
});

describe('world_slider', () => {
  it('generates the bare number, like the math_number it stands in for', () => {
    const code = generatorFor('world_slider')(
      {getFieldValue: () => 0.035} as never,
      {} as never,
      {} as never,
    ) as [string, number];

    expect(code[0]).toBe('0.035');
  });

  it('generates 0 rather than NaN for an empty field', () => {
    // A shadow the learner has cleared must not emit `actor.addEffect(…, NaN)`,
    // which reaches the shader as a uniform and blanks the sprite.
    const code = generatorFor('world_slider')(
      {getFieldValue: () => null} as never,
      {} as never,
      {} as never,
    ) as [string, number];

    expect(code[0]).toBe('0');
  });
});

describe('world_rgba', () => {
  const rgbaCode = (values: Record<string, string>) =>
    (
      generatorFor('world_rgba')(
        {} as never,
        {
          valueToCode: (_block: unknown, name: string) => values[name] ?? '',
        } as never,
        {} as never,
      ) as [string, number]
    )[0];

  it('emits floats, not hex', () => {
    // The whole reason this block exists beside the picker: hex cannot carry
    // an alpha, and round-tripping through it would quantize every channel to
    // 8 bits — a slider dragged to 0.337 would arrive as 0.3372549.
    expect(rgbaCode({R: '1', G: '0.5', B: '0', A: '0.337'})).toBe(
      '[1, 0.5, 0, 0.337]',
    );
  });

  it('passes an expression through untouched', () => {
    // A channel can be driven by something — a variable, a query, arithmetic.
    // That is the other thing the picker cannot do.
    expect(rgbaCode({R: 'other', G: '0', B: '0', A: '1'})).toBe(
      '[other, 0, 0, 1]',
    );
  });

  it('defaults a cleared channel to 0, and a cleared alpha to opaque', () => {
    // Alpha is the odd one out: an empty socket meaning "invisible" would make
    // clearing it look like the block broke.
    expect(rgbaCode({})).toBe('[0, 0, 0, 1]');
  });
});

describe('color spelling', () => {
  // The lab is US English throughout — the effect editor calls a vec3
  // "color (RGB)", the stock effects name the parameter `color` — and the
  // stock Blockly blocks in this category ship British text. This pins the
  // replacement so a Blockly upgrade re-introducing "colour" is caught here
  // rather than by someone reading the toolbox.
  it('replaces the British text on the stock color blocks', () => {
    installColorMessages();

    for (const key of [
      'COLOUR_PICKER_TOOLTIP',
      'COLOUR_RANDOM_TITLE',
      'COLOUR_RANDOM_TOOLTIP',
      'COLOUR_BLEND_COLOUR1',
      'COLOUR_BLEND_TOOLTIP',
      'COLOUR_RGB_TITLE',
      'COLOUR_RGB_TOOLTIP',
    ]) {
      expect(Blockly.Msg[key]).not.toMatch(/colour/i);
      expect(Blockly.Msg[key]).toMatch(/color/i);
    }
  });

  it('leaves the rest of the locale intact', () => {
    // The trap this hit: `Agent.inject` loads English only when `Blockly.Msg`
    // is empty, so assigning a single override skips the whole locale and
    // every other message reads undefined.
    installColorMessages();

    expect(Blockly.Msg.WORKSPACE_LABEL_MANY_STACKS).toBeTruthy();
    expect(Object.keys(Blockly.Msg).length).toBeGreaterThan(100);
  });

  it('names the category in US spelling', () => {
    const names = (DOMAIN_TOOLBOX as Array<{name: string}>).map(c => c.name);
    expect(names).toContain('Color');
    expect(names).not.toContain('Colour');
  });
});

describe('the block that raises an event', () => {
  // Generated per event, from the same signature the hat is built from — so it
  // says which event in its own words and takes exactly what that event
  // carries. It replaces a pair of hand-written blocks that named their event
  // in a dropdown and always said "with", whether there was anything to carry
  // or not.
  const emit = (
    type: string,
    values: Record<string, string>,
    definitions: Record<string, string> = {},
  ): string =>
    generatorFor(type)(
      {getFieldValue: () => null} as never,
      {
        definitions_: definitions,
        valueToCode: (_block: unknown, name: string) => values[name] ?? '',
      } as never,
      {} as never,
    ) as string;

  it('emits a built-in event through the WorldLab namespace', () => {
    expect(
      emit('world_emit_Appearance_AnimationEndedEvent', {ACTOR: 'other'}),
    ).toBe('world.emit(WorldLab.AnimationEndedEvent, other);\n');
  });

  it('defaults to the principal actor when the socket is empty', () => {
    expect(emit('world_emit_Appearance_AnimationEndedEvent', {})).toBe(
      'world.emit(WorldLab.AnimationEndedEvent, actor);\n',
    );
  });

  it('reads `emit <event> for <actor>`, in the event’s own words', () => {
    const block = DOMAIN_BLOCKS.find(
      b => b.type === 'world_emit_Appearance_AnimationEndedEvent',
    ) as {message0: string} | undefined;

    expect(block?.message0).toBe('emit animation ends for %1');
  });

  it('imports a project rule’s event from its module', () => {
    const defs: Record<string, string> = {};
    const block = PROJECT_BLOCKS.blocks.find(
      b => b.type === 'world_emit_HasWind_GustedEvent',
    )!;

    const code = block.generator.javascript(
      {getFieldValue: () => null} as never,
      {
        definitions_: defs,
        valueToCode: () => 'other',
      } as never,
      {} as never,
    ) as string;

    expect(code).toBe('world.emit(GustedEvent, other);\n');
    expect(defs['named:rules/wind:GustedEvent']).toBe(
      'import {GustedEvent} from "rules/wind";',
    );
  });

  it('is offered only while a `.rule` is being edited', () => {
    // Raising an event is a rule-authoring act. An event is a rule's own
    // vocabulary and the rule is the authority on when it happened — gravity
    // is what knows a fall started. An `.actor` or a `.world` firing one is
    // announcing something it is not the authority on, and every listener then
    // believes it. So the category carries the hat everywhere and the emit only
    // where the rule is being written.
    const hat = 'world_on_HasWind_GustedEvent';
    const raise = 'world_emit_HasWind_GustedEvent';

    // The palette an `.actor` or `.world` editor gets: no ownRuleModule.
    expect(projectCategory('Has Wind')).toContain(hat);
    expect(projectCategory('Has Wind')).not.toContain(raise);

    // …and the rule's own editor, which gets both.
    const editing = buildDomainPalette([PROJECT_RULE], {
      ownRuleModule: 'rules/wind',
    });
    const blocks =
      (editing.toolbox as Array<{name: string; blocks: string[]}>).find(
        category => category.name === 'Has Wind',
      )?.blocks ?? [];
    expect(blocks).toContain(hat);
    expect(blocks).toContain(raise);
  });

  it('stays REGISTERED where it is not offered', () => {
    // Taking it off the menu is not emptying the kitchen. An `.actor` that
    // already holds one has to keep loading and generating: a palette that
    // could not define the block would fail the whole project rather than the
    // one block (see shippedBlocks).
    expect(PROJECT_BLOCKS.blocks.map(block => block.type)).toContain(
      'world_emit_HasWind_GustedEvent',
    );
  });
});

describe('vector arithmetic', () => {
  // Gravity's step is the worked example: "add direction × strength × delta to
  // the velocity" could not be written at all before this block, and reads as
  // one sentence because either side may be a vector or a number.
  const value = (
    type: string,
    values: Record<string, string>,
    fields: Record<string, string> = {},
    leftCheck: string[] | null = ['Vector'],
  ) =>
    (
      generatorFor(type)(
        {
          getFieldValue: (name: string) => fields[name] ?? null,
          getInputTargetBlock: (name: string) =>
            name === 'A' && values.A
              ? {outputConnection: {getCheck: () => leftCheck}}
              : null,
        } as never,
        {
          valueToCode: (_b: unknown, name: string) => values[name] ?? '',
        } as never,
        {} as never,
      ) as [string, number]
    )[0];

  it('maps each operator to its component-wise method', () => {
    const ops = {
      ADD: 'add',
      SUBTRACT: 'subtract',
      MULTIPLY: 'multiply',
      DIVIDE: 'divide',
    };
    for (const [op, method] of Object.entries(ops)) {
      expect(value('world_vector_math', {A: 'v', B: 'w'}, {OP: op})).toBe(
        `v.${method}(w)`,
      );
    }
  });

  it('takes a number on either side, GLSL-style', () => {
    // `velocity × delta` — a scalar on the right needs nothing: the engine's
    // Vector methods broadcast it (core/Vector).
    expect(
      value('world_vector_math', {A: 'v', B: 'delta'}, {OP: 'MULTIPLY'}),
    ).toBe('v.multiply(delta)');
    // `2 × direction` — a scalar on the LEFT has no method to call, so it is
    // broadcast into a vector first. Same rule, other side.
    expect(
      value('world_vector_math', {A: '2', B: 'v'}, {OP: 'MULTIPLY'}, [
        'Number',
      ]),
    ).toBe('WorldLab.Vector.broadcast(2).multiply(v)');
  });

  it('defaults to adding when the operator is missing', () => {
    // A block deserialized without its field still has to generate something.
    expect(value('world_vector_math', {A: 'v', B: 'w'})).toBe('v.add(w)');
  });

  it('falls back to a zero vector rather than emitting nothing', () => {
    // An empty socket must still produce a Vector: `undefined.add(…)` would
    // take the game down on the first tick.
    expect(value('world_vector_math', {}, {OP: 'ADD'}, null)).toBe(
      'WorldLab.Vector.broadcast(new WorldLab.Vector(0, 0)).add(0)',
    );
  });

  it('still rotates, which is not arithmetic', () => {
    expect(value('world_vector_rotate', {VECTOR: 'v', DEGREES: '180'})).toBe(
      'v.rotate(180)',
    );
  });
});

describe('world_rgba block shape', () => {
  const rgbaBlock = () => {
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_rgba');
    if (!block) {
      throw new Error('no world_rgba block');
    }
    return block;
  };

  it('leads with a color swatch, then the four channels', () => {
    // The swatch is what the channels are working toward; reading it first is
    // the point. It is also where the presets live (rgbaPreview).
    const args = (rgbaBlock().args0 ?? []) as Array<{name?: string}>;
    expect(args.map(arg => arg.name)).toEqual(['PREVIEW', 'R', 'G', 'B', 'A']);
  });

  it('carries the extension that keeps the swatch and channels in step', () => {
    const names = (rgbaBlock().extensions ?? []).map(extension =>
      typeof extension === 'string' ? extension : extension.name,
    );
    expect(names).toContain(RGBA_PREVIEW_EXTENSION);
    // …and the one that seeds each channel with a slider.
    expect(names).toContain(VALUE_SHADOW_EXTENSION);
  });

  it('outputs what the stock color blocks actually output', () => {
    // Built and asked, rather than compared against a literal. A connection
    // check is a string equality, and asserting a literal is precisely what
    // failed to catch it when a spelling sweep changed our side and the test
    // together, leaving the picker unable to plug into its own socket:
    //
    //   Output Connection of "colour_picker" expected Colour, found Color
    //
    // Reading it off the block we have to connect to cannot drift that way.
    installAllBlocks({});
    const workspace = new Blockly.Workspace();
    const picker = workspace.newBlock('colour_picker');

    expect(picker.outputConnection?.getCheck()).toEqual([rgbaBlock().output]);
  });

  it('offers exactly what an effect’s color socket checks for', () => {
    // The other half of the same equality. Both sides read one constant now,
    // and this is the assertion that says so.
    expect(rgbaBlock().output).toBe(COLOUR_CHECK);
    expect(paramSockets('vec3')[0].kind).toBe('color');
  });
});

describe('actor-placing block generators', () => {
  // These blocks read block.id and register imports on generator.definitions_
  // (which Blockly's finish() hoists), so they need richer fakes than `emit`.
  // `world_add_actor` reads its `DO` input via `statementToCode` — the fake
  // returns `body` for both that and the next chain.
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
  ) => {
    const nextBlock = body ? {} : null;
    return generatorFor(type)(
      {
        getFieldValue: (n: string) => block[n],
        id: block.id,
        getNextBlock: () => nextBlock,
      } as never,
      {
        definitions_: definitions,
        statementToCode: () => body,
        blockToCode: (b: unknown) => (b === nextBlock ? body : ''),
        // Blockly maps a variable id to a safe identifier; the id here stands
        // in for one the workspace made.
        getVariableName: () => 'placed',
      } as never,
      {} as never,
    ) as string;
  };

  it('world_add_actor block-scopes the instance, using the block id as its id', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_actor',
      {ACTOR: 'actors/coin', id: 'add-coin'},
      defs,
      'actor.set(X);\n',
    );
    expect(code).toBe(
      '{\nconst actor = world.addActor(ActorsCoin, "add-coin", "actors/coin", "main");\n' +
        'actor.set(X);\n}\n',
    );
    expect(defs['mod:actors/coin']).toBe(
      'import ActorsCoin from "actors/coin";',
    );
  });

  it('binds `actor` when no name was chosen, as every saved block expects', () => {
    // The compatibility case. A block saved before the field existed has no
    // NAMED value, and its body says `this actor` MEANING the new actor — so
    // the absence of state has to keep binding `actor`.
    const code = run(
      'world_add_actor',
      {ACTOR: 'actors/coin', id: 'add-coin'},
      {},
      '',
    );

    expect(code).toContain('const actor = world.addActor(');
  });

  it('binds the variable instead when one is named', () => {
    // Which is the whole point: `actor` is left alone, so the body's
    // `this actor` goes on meaning whatever encloses the block — the player
    // doing the placing, rather than the bullet being placed.
    const code = run(
      'world_add_actor',
      {ACTOR: 'actors/coin', id: 'add-coin', NAMED: 'named', VAR: 'v1'},
      {},
      '',
    );

    expect(code).toContain('const placed = world.addActor(');
    expect(code).not.toContain('const actor = world.addActor(');
  });
});

describe('world block generators', () => {
  // The world root reads its body from the next chain, like the actor root.
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
    // Value sockets, by input name — what `valueToCode` would return. An input
    // with no entry reads as '' (a socket emptied of its shadow).
    sockets: Record<string, string> = {},
    // `add effect`'s serialized parameter list, which its generator reads off
    // the block to know which sockets exist.
    effectParams?: unknown[],
  ) => {
    const nextBlock = body ? {} : null;
    return generatorFor(type)(
      {
        getFieldValue: (n: string) => block[n],
        id: block.id,
        getNextBlock: () => nextBlock,
        effectParams_: effectParams,
      } as never,
      {
        definitions_: definitions,
        statementToCode: () => body,
        blockToCode: (b: unknown) => (b === nextBlock ? body : ''),
        valueToCode: (_block: unknown, name: string) => sockets[name] ?? '',
      } as never,
      {} as never,
    ) as string;
  };

  it('world_world builds the world and hosts its body', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_world',
      {NAME: 'Platform World'},
      defs,
      'world.useRules([X]);\n',
    );
    // The id is derived from the name: spaces become underscores.
    expect(code).toBe(
      'const world = new WorldLab.WorldBuilder({id: "Platform_World", name: "Platform World"});\n' +
        'world.useRules([X]);\n',
    );
    expect(defs['world_lab']).toBe(`import * as WorldLab from 'world-lab';`);
  });

  it('world_use_rule adds a built-in rule by name, as its world-lab export', () => {
    // The dropdown no longer OFFERS the engine's two rules — every world has
    // them already (blockly/foundation) — but a saved block naming one keeps
    // its value, and still means exactly this.
    expect(run('world_use_rule', {RULE: 'Space'}, {}, '')).toBe(
      'world.useRules([WorldLab.SpatialRule]);\n',
    );
  });

  it('world_use_rule at "(none)" emits nothing', () => {
    // A project holding no rules at all: the dropdown's only real row is
    // "(none)", and the alternative here is `WorldLab.` with no name after it,
    // which is a syntax error rather than a missing rule.
    expect(run('world_use_rule', {RULE: ''}, {}, '')).toBe('');
  });

  it('world_use_rule imports a project rule from wherever its name lives', () => {
    // The field says "Has Wind"; which file that is comes from the registry,
    // and is the only place in the generated module a path appears at all.
    const defs: Record<string, string> = {};
    expect(run('world_use_rule', {RULE: 'Has Wind'}, defs, '')).toBe(
      'world.useRules([RulesWind]);\n',
    );
    expect(defs['mod:rules/wind']).toBe('import RulesWind from "rules/wind";');
  });

  it('world_use_rule treats an unknown value as a module — a `.js` rule', () => {
    // A hand-written rule declares no name to be found by, so it is referred to
    // by its file and imported from exactly there.
    const defs: Record<string, string> = {};
    expect(run('world_use_rule', {RULE: 'rules/animation'}, defs, '')).toBe(
      'world.useRules([RulesAnimation]);\n',
    );
    expect(defs['mod:rules/animation']).toBe(
      'import RulesAnimation from "rules/animation";',
    );
  });

  it('world_add_effect imports the .effect as data and applies it', () => {
    // The path is passed alongside the document because it is the effect's
    // identity: the driver registers one shader render node per path, so the
    // same effect on many actors is one compiled program.
    //
    // With the ACTOR socket empty the target is the bare identifier `actor` —
    // which is the template under `define actor` and the live actor inside a
    // handler. One block, both jobs; `addEffect` is on both objects.
    const defs: Record<string, string> = {};
    const code = run('world_add_effect', {EFFECT: 'effects/ripple'}, defs, '');
    expect(code).toBe('actor.addEffect("effects/ripple", EffectsRipple);\n');
    expect(defs['mod:effects/ripple']).toBe(
      'import EffectsRipple from "effects/ripple";',
    );
  });

  it('world_add_effect passes parameter values by parameter id', () => {
    // The sockets are built from the block's own serialized parameter list, so
    // the generator reads that same list to know what to emit.
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/ripple'},
      defs,
      '',
      {EPARAM_0_0: '0.05'},
      [{id: 'strength', name: 'strength', type: 'float', defaultValue: 0.02}],
    );
    expect(code).toBe(
      'actor.addEffect("effects/ripple", EffectsRipple, {"strength": 0.05});\n',
    );
  });

  it('world_add_effect falls back to a parameter default for an empty socket', () => {
    // A socket emptied of its shadow reads as '' — the declared default is what
    // the effect would have used anyway, so emit that rather than 0.
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/ripple'},
      {},
      '',
      {},
      [{id: 'strength', name: 'strength', type: 'float', defaultValue: 0.02}],
    );
    expect(code).toContain('{"strength": 0.02}');
  });

  it('world_add_effect gathers a vec2 into an array', () => {
    // A vec2 is a direction or an offset, not a color — it keeps its pair of
    // number sockets.
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/skew'},
      {},
      '',
      {EPARAM_0_0: '1', EPARAM_0_1: '0.5'},
      [{id: 'offset', name: 'offset', type: 'vec2', defaultValue: [0, 0]}],
    );
    expect(code).toContain('{"offset": [1, 0.5]}');
  });

  it('world_add_effect converts a vec3 color socket to shader floats', () => {
    // The socket holds a color block, which speaks `#rrggbb`; the uniform
    // wants three 0–1 floats. Converting in the generated code rather than in
    // the block is what lets any color block feed the socket.
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/tint'},
      defs,
      '',
      {EPARAM_0_0: "'#ff8800'"},
      [{id: 'color', name: 'color', type: 'vec3', defaultValue: [0, 0, 0]}],
    );
    expect(code).toContain(`{"color": WorldLab.rgb('#ff8800')}`);
    // …and the module it names has to be imported.
    expect(defs['world_lab']).toBe(`import * as WorldLab from 'world-lab';`);
  });

  it('world_add_effect takes a vec4 from the same single color socket', () => {
    // No separate opacity socket: alpha rides in the value, whether that is an
    // eight-digit hex or the float array `r g b a` produces.
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/tint'},
      {},
      '',
      {EPARAM_0_0: '[1, 0.5, 0, 0.25]'},
      [{id: 'color', name: 'color', type: 'vec4', defaultValue: [0, 0, 0, 1]}],
    );
    expect(code).toContain(`{"color": WorldLab.rgba([1, 0.5, 0, 0.25])}`);
  });

  it('world_add_effect falls back to the declared color as floats', () => {
    // An emptied color socket still has to produce the effect's own default.
    // Handed over as floats, not hex: `rgb`/`rgba` take either, and hex would
    // drop a vec4's alpha and quantize the rest for nothing.
    const code = run('world_add_effect', {EFFECT: 'effects/tint'}, {}, '', {}, [
      {id: 'color', name: 'color', type: 'vec3', defaultValue: [1, 0.5, 0]},
    ]);
    expect(code).toContain(`{"color": WorldLab.rgb([1, 0.5, 0])}`);
  });

  it('world_add_effect keeps a vec4 default’s alpha in the fallback', () => {
    // Padding a three-component default to four would write an explicit alpha
    // of 0, and `rgba` could no longer tell it was never given one.
    const code = run('world_add_effect', {EFFECT: 'effects/tint'}, {}, '', {}, [
      {
        id: 'color',
        name: 'color',
        type: 'vec4',
        defaultValue: [1, 0.6, 0.6, 1],
      },
    ]);
    expect(code).toContain(`{"color": WorldLab.rgba([1, 0.6, 0.6, 1])}`);
  });

  it('world_add_effect emits a boolean parameter as true/false', () => {
    const code = run('world_add_effect', {EFFECT: 'effects/glow'}, {}, '', {}, [
      {id: 'on', name: 'on', type: 'bool', defaultValue: 1},
    ]);
    expect(code).toContain('{"on": true}');
  });

  it('world_add_effect omits the argument when the effect has no parameters', () => {
    const code = run('world_add_effect', {EFFECT: 'effects/ripple'}, {}, '');
    expect(code).toBe('actor.addEffect("effects/ripple", EffectsRipple);\n');
  });

  it('world_add_effect names the socket target when one is plugged in', () => {
    const defs: Record<string, string> = {};
    const code = run('world_add_effect', {EFFECT: 'effects/glow'}, defs, '', {
      ACTOR: 'actor',
    });
    expect(code).toBe('actor.addEffect("effects/glow", EffectsGlow);\n');
    expect(defs['mod:effects/glow']).toBe(
      'import EffectsGlow from "effects/glow";',
    );
  });

  it('world_add_effect passes explicit values alongside a socket target', () => {
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/glow'},
      {},
      '',
      {ACTOR: 'actor', EPARAM_0_0: '0.8'},
      [{id: 'bright', name: 'bright', type: 'float', defaultValue: 0.2}],
    );
    expect(code).toContain('{"bright": 0.8}');
  });

  it('world_add_effect targets whatever is in the ACTOR socket', () => {
    // A loop's touched actor, say — not just `this actor`.
    const code = run('world_add_effect', {EFFECT: 'effects/glow'}, {}, '', {
      ACTOR: 'touched',
    });
    expect(code).toBe('touched.addEffect("effects/glow", EffectsGlow);\n');
  });

  it('world_remove_effect needs only the path, so imports nothing', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_remove_effect',
      {EFFECT: 'effects/glow'},
      defs,
      '',
      {
        ACTOR: 'actor',
      },
    );
    expect(code).toBe('actor.removeEffect("effects/glow");\n');
    expect(Object.keys(defs)).toEqual([]);
  });

  it('the runtime effect blocks emit nothing without a chosen effect', () => {
    expect(run('world_add_effect', {EFFECT: ''}, {}, '', {})).toBe('');
    expect(run('world_remove_effect', {EFFECT: ''}, {}, '', {})).toBe('');
  });

  it('world_remove_actor takes out whatever is in its socket', () => {
    // An instance, not a kind: the coin that was touched, the actor a loop is
    // looking at, `this actor`.
    expect(run('world_remove_actor', {}, {}, '', {ACTOR: 'touched'})).toBe(
      'world.removeActor(touched);\n',
    );
  });

  it('world_remove_actor falls back to this actor', () => {
    // The socket's shadow is `this actor`; an emptied socket still means the
    // actor whose handler this is.
    expect(run('world_remove_actor', {}, {}, '', {})).toBe(
      'world.removeActor(actor);\n',
    );
  });

  it('world_clear_world empties the world, taking no subject at all', () => {
    // "All of them" is the whole meaning of the block, so there is nothing to
    // read off it — not a socket, not a field, not even `this actor`.
    expect(run('world_clear_world', {}, {}, '', {})).toBe(
      'world.clearActors();\n',
    );
  });

  it('world_add_effect emits nothing when the project has no effects', () => {
    // The dropdown shows a "(none)" placeholder with an empty value; emitting
    // `actor.addEffect("", undefined)` would be a runtime error for a block the
    // learner has not finished filling in.
    const defs: Record<string, string> = {};
    expect(run('world_add_effect', {EFFECT: ''}, defs, '')).toBe('');
    expect(Object.keys(defs)).toEqual([]);
  });

  it('world_add_world_effect starts a viewport effect at runtime', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_world_effect',
      {EFFECT: 'effects/underwater'},
      defs,
      '',
    );
    expect(code).toBe(
      'world.addEffect("effects/underwater", EffectsUnderwater);\n',
    );
    expect(defs['mod:effects/underwater']).toBe(
      'import EffectsUnderwater from "effects/underwater";',
    );
  });

  it('world_add_world_effect carries parameter values', () => {
    const code = run(
      'world_add_world_effect',
      {EFFECT: 'effects/underwater'},
      {},
      '',
      {EPARAM_0_0: '0.4'},
      [{id: 'murk', name: 'murk', type: 'float', defaultValue: 0.1}],
    );
    expect(code).toContain('{"murk": 0.4}');
  });

  it('world_remove_world_effect needs only the path', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_remove_world_effect',
      {EFFECT: 'effects/underwater'},
      defs,
      '',
    );
    expect(code).toBe('world.removeEffect("effects/underwater");\n');
    expect(Object.keys(defs)).toEqual([]);
  });

  it('the runtime world blocks emit nothing without a chosen effect', () => {
    expect(run('world_add_world_effect', {EFFECT: ''}, {}, '')).toBe('');
    expect(run('world_remove_world_effect', {EFFECT: ''}, {}, '')).toBe('');
  });

  it('world_set_background names a whole image, never a cell', () => {
    // The sprite field can carry `coinSpin.png#3`; this one cannot. A backdrop
    // is stretched over the viewport, so a grid of it means nothing.
    expect(run('world_set_background', {BACKGROUND: 'cave.png'}, {}, '')).toBe(
      'world.setBackground("cave.png", "main");\n',
    );
  });

  it('generates the same six blocks for both image slots', () => {
    // They differ in one word, so they come from one factory over the two
    // slots rather than six hand-written near-copies — the house idiom, and
    // what stops `set foreground` drifting away from `set background`.
    const types = DOMAIN_BLOCKS.map(block => block.type);
    for (const slot of ['background', 'foreground']) {
      expect(types).toContain(`world_set_${slot}`);
      expect(types).toContain(`world_set_${slot}_offset`);
      expect(types).toContain(`world_set_${slot}_repeat`);
    }
  });

  it('slides a slot by a vector, naming the layer it is written in', () => {
    const code = generatorFor('world_set_foreground_offset')(
      {getFieldValue: () => null} as never,
      {
        valueToCode: () => 'new WorldLab.Vector(8, 0)',
      } as never,
      {} as never,
    ) as string;

    expect(code).toBe(
      'world.setForegroundOffset(new WorldLab.Vector(8, 0), "main");\n',
    );
  });

  it('defaults a slide to no movement rather than to nothing', () => {
    // An emptied socket is a vector of zero, not a syntax error.
    const code = generatorFor('world_set_background_offset')(
      {getFieldValue: () => null} as never,
      {valueToCode: () => ''} as never,
      {} as never,
    ) as string;

    expect(code).toBe(
      'world.setBackgroundOffset(new WorldLab.Vector(0, 0), "main");\n',
    );
  });

  it('turns tiling on and off with a word rather than a boolean socket', () => {
    // Whether an image tiles is an authoring choice, not something a program
    // computes — so it reads `draw background ⟨tiled⟩`.
    const run = (value: string) =>
      generatorFor('world_set_background_repeat')(
        {getFieldValue: () => value} as never,
        {} as never,
        {} as never,
      ) as string;

    expect(run('true')).toBe('world.setBackgroundRepeat(true, "main");\n');
    expect(run('false')).toBe('world.setBackgroundRepeat(false, "main");\n');
  });

  it('world_set_background_color hands the color over as it arrived', () => {
    // Not through `WorldLab.rgb`, unlike an effect's color parameter: a uniform
    // needs floats, `setBackgroundColor` takes either, and converting here
    // would drop the alpha of an `r g b a` block on the way past.
    expect(
      run('world_set_background_color', {}, {}, '', {COLOR: "'#88ccff'"}),
    ).toBe("world.setBackgroundColor('#88ccff');\n");
    expect(
      run('world_set_background_color', {}, {}, '', {
        COLOR: '[1, 0.5, 0, 0.25]',
      }),
    ).toBe('world.setBackgroundColor([1, 0.5, 0, 0.25]);\n');
  });

  it('world_add_background_effect filters the sky and not the swimmer', () => {
    // The whole point of a backdrop carrying its own effects: `addEffect` would
    // filter the camera, and everything the camera drew with it.
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_background_effect',
      {EFFECT: 'effects/ripple'},
      defs,
      '',
    );
    expect(code).toBe(
      'world.addBackgroundEffect("effects/ripple", EffectsRipple, undefined, "main");\n',
    );
    expect(defs['mod:effects/ripple']).toBe(
      'import EffectsRipple from "effects/ripple";',
    );
  });

  it('world_add_background_effect carries parameter values', () => {
    const code = run(
      'world_add_background_effect',
      {EFFECT: 'effects/ripple'},
      {},
      '',
      {EPARAM_0_0: '0.4'},
      [{id: 'speed', name: 'speed', type: 'float', defaultValue: 0.1}],
    );
    expect(code).toContain('{"speed": 0.4}');
  });

  it('world_remove_background_effect needs only the path', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_remove_background_effect',
      {EFFECT: 'effects/ripple'},
      defs,
      '',
    );
    expect(code).toBe(
      'world.removeBackgroundEffect("effects/ripple", "main");\n',
    );
    expect(Object.keys(defs)).toEqual([]);
  });

  it('generates an add/remove pair for each non-actor effect owner', () => {
    const types = DOMAIN_BLOCKS.map(block => block.type);
    for (const owner of ['world', 'background', 'foreground']) {
      expect(types).toContain(`world_add_${owner}_effect`);
      expect(types).toContain(`world_remove_${owner}_effect`);
    }
  });

  it('keeps the ACTOR pair out of that factory, because it takes a socket', () => {
    // The asymmetry is the point rather than an omission: an actor effect must
    // be able to name the coin that was touched, or `any ⟨Coin⟩`, and a
    // dropdown cannot say either.
    const actorAdd = DOMAIN_BLOCKS.find(
      block => block.type === 'world_add_effect',
    ) as {args0: Array<{type: string; name: string}>};

    expect(actorAdd.args0.some(arg => arg.type === 'input_value')).toBe(true);
  });

  it('names the layer for a slot effect, and does not for the world’s', () => {
    // A world effect covers the whole screen and belongs to no layer; a slot's
    // belongs to the layer its block is written in.
    const defs: Record<string, string> = {};
    const run = (type: string) =>
      generatorFor(type)(
        {getFieldValue: () => 'effects/ripple'} as never,
        {definitions_: defs, valueToCode: () => ''} as never,
        {} as never,
      ) as string;

    expect(run('world_add_foreground_effect')).toBe(
      'world.addForegroundEffect("effects/ripple", EffectsRipple, undefined, "main");\n',
    );
    expect(run('world_add_world_effect')).toBe(
      'world.addEffect("effects/ripple", EffectsRipple);\n',
    );
    expect(run('world_remove_foreground_effect')).toBe(
      'world.removeForegroundEffect("effects/ripple", "main");\n',
    );
    expect(run('world_remove_world_effect')).toBe(
      'world.removeEffect("effects/ripple");\n',
    );
  });

  it('the background blocks emit nothing before they are filled in', () => {
    // A "(none)" dropdown and an emptied socket both read as ''; emitting a
    // call with it would be a runtime error for a half-built block.
    expect(run('world_set_background', {BACKGROUND: ''}, {}, '')).toBe('');
    expect(run('world_set_background_color', {}, {}, '', {COLOR: ''})).toBe('');
    expect(run('world_add_background_effect', {EFFECT: ''}, {}, '')).toBe('');
    expect(run('world_remove_background_effect', {EFFECT: ''}, {}, '')).toBe(
      '',
    );
  });

  it('registers every animation file the project holds, with no block for it', () => {
    // There is no `use animations` block and deliberately so: an animation file
    // is not something a world opts into, it is something the project HAS. A
    // learner who draws one and plays it should not also have to remember to
    // say the world may use it.
    setProjectAnimationFiles([
      ['game', 'animations/game'],
      ['coinSpin', 'animations/coinSpin'],
    ]);
    const defs: Record<string, string> = {};
    const code = run('world_world', {NAME: 'Platform World'}, defs, '');

    expect(code).toContain(
      'world.useAnimations(WorldLab.parseAnimationFile(AnimationsGame));',
    );
    expect(code).toContain(
      'world.useAnimations(WorldLab.parseAnimationFile(AnimationsCoinSpin));',
    );
    expect(defs['mod:animations/game']).toBe(
      'import AnimationsGame from "animations/game";',
    );
    setProjectAnimationFiles([]);
  });

  it('puts every rule the project holds in play, with no block for it', () => {
    // Same argument as the animations above, and now made for rules too: a
    // file is not a thing a world opts into, it is a thing the project HAS.
    // What made it safe to say is that a rule with no elected trait does
    // nothing, so gravity in a world with nothing falling costs a learner
    // nothing but used to cost them a row.
    setProjectRuleModules([
      ['input', 'rules/input'],
      ['gravity', 'rules/gravity'],
    ]);
    const defs: Record<string, string> = {};

    const code = run('world_world', {NAME: 'Platform World'}, defs, '');

    expect(code).toContain('world.useRules([RulesInput]);');
    expect(code).toContain('world.useRules([RulesGravity]);');
    expect(defs['mod:rules/input']).toBe(
      'import RulesInput from "rules/input";',
    );
    expect(defs['mod:rules/gravity']).toBe(
      'import RulesGravity from "rules/gravity";',
    );
    setProjectRuleModules([]);
  });

  it('emits no rule the project does not hold', () => {
    // Delete the file and nothing is emitted — the world generator never
    // conjures a module the project has not got.
    const defs: Record<string, string> = {};

    const code = run('world_world', {NAME: 'Platform World'}, defs, '');

    expect(code).not.toContain('useRules');
    expect(defs['mod:rules/input']).toBeUndefined();
  });
});

describe('world_load_map generator', () => {
  afterEach(() => setProjectMaps({}));

  it('names an actor and a rule apart when they share a file name', () => {
    // THE BUG THIS PINS. An import name was the last path segment, so a
    // project holding `actors/healthBar` and `rules/healthBar` — which is
    // exactly what importing the stock Health Bar gives you — emitted two
    // imports called `HealthBar` and would not compile: "The symbol HealthBar
    // has already been declared". Any actor and rule sharing a name did it.
    setProjectMaps({'maps/level1': ['actors/healthBar']});
    const defs: Record<string, string> = {};
    const placed = generatorFor('world_load_map')(
      {getFieldValue: () => 'maps/level1'} as never,
      {definitions_: defs, statementToCode: () => ''} as never,
      {} as never,
    ) as string;
    const used = generatorFor('world_use_rule')(
      {getFieldValue: () => 'rules/healthBar'} as never,
      {definitions_: defs} as never,
      {} as never,
    ) as string;

    expect(placed).toContain('ActorsHealthBar');
    expect(used).toContain('RulesHealthBar');
    // …and both imports survive, because they are two names rather than one.
    const bindings = Object.values(defs)
      .map(line => /^import (\w+) /.exec(line)?.[1])
      .filter(Boolean);
    expect(new Set(bindings).size).toBe(bindings.length);
  });

  it('imports+defines each actor the map places, then loads it', () => {
    setProjectMaps({'maps/level1': ['actors/player', 'actors/coin']});
    const defs: Record<string, string> = {};
    const code = generatorFor('world_load_map')(
      {getFieldValue: () => 'maps/level1'} as never,
      {definitions_: defs, statementToCode: () => ''} as never,
      {} as never,
    ) as string;
    expect(code).toBe(
      'world.define("actors/player", ActorsPlayer);\n' +
        'world.define("actors/coin", ActorsCoin);\n' +
        'world.loadMap(MapsLevel1, "main");\n',
    );
    expect(defs['mod:actors/player']).toBe(
      'import ActorsPlayer from "actors/player";',
    );
    expect(defs['mod:actors/coin']).toBe(
      'import ActorsCoin from "actors/coin";',
    );
    expect(defs['map:maps/level1']).toBe(
      'import MapsLevel1 from "maps/level1";',
    );
  });
});

describe('buildDomainPalette (project rule blocks)', () => {
  // A declarative project rule: a world `strength` property + a `gusted` event.
  // define rule Has Wind → world property `strength`; a `Windblown` trait whose
  // `do` holds an event. (Events nest inside a trait.)
  const wind = parseRuleMeta(
    'rules/wind',
    JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Has Wind'},
            next: {
              block: {
                type: 'world_rule_property',
                fields: {TYPE: 'number', NAME: 'strength', DEFAULT: '0'},
              },
            },
          },
          // The trait, beside the rule.
          {
            type: 'world_rule_trait',
            fields: {NAME: 'Windblown'},
            next: {
              block: {
                type: 'world_rule_event',
                extraState: {parts: [{kind: 'label', text: 'gusted'}]},
              },
            },
          },
        ],
      },
    }),
  )!;

  it('returns the built-in palette unchanged with no project rules', () => {
    const p = buildDomainPalette([]);
    expect(p.blocks).toBe(DOMAIN_BLOCKS);
    expect(p.toolbox).toBe(DOMAIN_TOOLBOX);
    expect(p.rootTypes).toBe(ROOT_BLOCK_TYPES);
  });

  it('extends the palette with a project rule’s blocks (collision-safe types)', () => {
    const {blocks, toolbox, rootTypes} = buildDomainPalette([wind]);
    const types = blocks.map(b => b.type);
    // Namespaced by the RULE, so two rules' same-named members cannot collide —
    // and a member keeps its block type if its rule's file is renamed.
    expect(types).toContain('world_set_HasWind_StrengthProperty');
    expect(types).toContain('world_get_HasWind_StrengthProperty');
    expect(types).toContain('world_on_HasWind_GustedEvent'); // project event hat
    // Built-ins are still present, namespaced the same way.
    expect(types).toContain('world_set_position'); // Spatial's, a hand-written one
    expect(types).toContain('world_get_Space_PositionProperty');
    // A toolbox category for the project rule, carrying its blocks.
    const cats = toolbox as Array<{name: string; blocks: string[]}>;
    expect(cats.find(c => c.name === 'Has Wind')?.blocks).toContain(
      'world_set_HasWind_StrengthProperty',
    );
    // The project event hat is a root (so the generator owns its next chain).
    expect(rootTypes.has('world_on_HasWind_GustedEvent')).toBe(true);
  });

  it('generates a project member’s codegen as an import from its module', () => {
    const {blocks} = buildDomainPalette([wind]);
    const setBlock = blocks.find(
      b => b.type === 'world_set_HasWind_StrengthProperty',
    )!;
    const defs: Record<string, string> = {};
    const code = setBlock.generator.javascript(
      {getFieldValue: () => ''} as never,
      {valueToCode: () => '5', definitions_: defs} as never,
      {} as never,
    );
    expect(code).toBe('world.set(StrengthProperty, 5);\n');
    expect(defs['named:rules/wind:StrengthProperty']).toBe(
      'import {StrengthProperty} from "rules/wind";',
    );
  });

  // A project rule whose members take parameters (declared via the params
  // mutator's `extraState`): a world action `Nudge(number amount, vector push)`
  // and an actor query `Near(actor other)`.
  const pushRule = parseRuleMeta(
    'rules/push',
    JSON.stringify({
      variables: [
        {id: 'a', name: 'amount', type: 'Number'},
        {id: 'b', name: 'push', type: 'Vector'},
        {id: 'c', name: 'other', type: 'Actor'},
      ],
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Pushes'},
            next: {
              block: {
                type: 'world_rule_block',
                fields: {RETURNS: 'none'},
                extraState: {
                  parts: [
                    {kind: 'label', text: 'Nudge'},
                    {kind: 'param', type: 'number', var: 'a'},
                    {kind: 'param', type: 'vector', var: 'b'},
                  ],
                },
              },
            },
          },
          // The trait, beside the rule.
          {
            type: 'world_rule_trait',
            fields: {NAME: 'Pushable'},
            next: {
              block: {
                type: 'world_rule_block',
                fields: {RETURNS: 'boolean'},
                extraState: {
                  parts: [
                    {kind: 'label', text: 'Near'},
                    {kind: 'param', type: 'actor', var: 'c'},
                  ],
                },
              },
            },
          },
        ],
      },
    }),
  )!;

  it('a project action’s call-site block passes all its params positionally', () => {
    // Registered as well as built: a member block whose rule the registry
    // cannot find generates nothing, which is how a deleted rule stops taking
    // the whole project down (`refResolves`). The editor does both together.
    registerProjectRules([pushRule]);
    const {blocks} = buildDomainPalette([pushRule]);
    const nudge = blocks.find(b => b.type === 'world_do_Pushes_NudgeAction')!;
    // Two params → two labelled sockets (AMOUNT, PUSH); both passed to `act`.
    const code = nudge.generator.javascript(
      {getFieldValue: () => ''} as never,
      {
        valueToCode: (_b: unknown, name: string) =>
          name === 'AMOUNT'
            ? '5'
            : name === 'PUSH'
              ? 'new WorldLab.Vector(1, 0)'
              : '',
        definitions_: {},
      } as never,
      {} as never,
    );
    expect(code).toBe(
      'world.act(NudgeAction, 5, new WorldLab.Vector(1, 0));\n',
    );
  });

  it('a project actor-query block takes its param after the actor', () => {
    registerProjectRules([pushRule]);
    const {blocks} = buildDomainPalette([pushRule]);
    const near = blocks.find(b => b.type === 'world_query_Pushes_NearQuery')!;
    const [code] = near.generator.javascript(
      {getFieldValue: () => ''} as never,
      {
        valueToCode: (_b: unknown, name: string) =>
          name === 'ACTOR' ? 'actor' : name === 'OTHER' ? 'other' : '',
        definitions_: {},
      } as never,
      {} as never,
    ) as [string, number];
    expect(code).toBe('actor.query(NearQuery, other)');
  });
});

describe('rule authoring blocks (`.rule` files)', () => {
  const AUTHORING = [
    'world_rule',
    'world_rule_trait',
    'world_rule_property',
    'world_rule_event',
  ];

  it('registers the declaration blocks with no-op generators', () => {
    for (const type of AUTHORING) {
      const block = DOMAIN_BLOCKS.find(b => b.type === type);
      expect(block, type).toBeDefined();
      // No JavaScript generator of their own — a `.rule` is codegen'd from its
      // parsed metadata (ruleMetaToModule), not block-by-block.
      expect(
        block!.generator.javascript({} as never, {} as never, {} as never),
      ).toBe('');
    }
  });

  it('offers a Rule toolbox category (with the dependency blocks)', () => {
    const cats = DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>;
    // The declarative authoring blocks, `use rule` / `use trait` for deps, and
    // the imperative `define block` (+ its `return`).
    expect(cats.find(c => c.name === 'Rule')?.blocks).toEqual([
      'world_rule',
      // …and the smaller thing a rule can be, offered beside it
      // (specs/BEHAVIORS.md).
      'world_behavior',
      'world_use_rule',
      'world_rule_trait',
      'world_use_trait',
      'world_rule_property',
      'world_rule_event',
      // A named set of choices, and one of its choices (specs/ENUMS.md).
      'world_rule_enum',
      'world_rule_enum_option',
      'world_rule_block',
      'world_return',
      'world_rule_step_tick',
      'world_rule_step_in',
      'world_trait_step',
      'world_step_delta',
      // Reading and writing a variable is its own category (below): a rule's
      // parameters are variables like any other.
    ]);
  });

  it('is a root block type (owns its declaration chain)', () => {
    expect(ROOT_BLOCK_TYPES.has('world_rule')).toBe(true);
  });
});

// Blocks that call a method only `ActorBuilder` has must warn when they are
// placed where `actor` is the live instance instead — an event handler. The
// predicate is covered in extensions/__tests__/actorContext.test.ts; what is
// checked here is that the extension is actually attached to the blocks that
// need it, and to no others.
describe('builder-context warnings', () => {
  const extensionsOf = (type: string): string[] => {
    const block = DOMAIN_BLOCKS.find(b => b.type === type);
    if (!block) {
      throw new Error(`no domain block '${type}'`);
    }
    return (block.extensions ?? []).map(extension =>
      typeof extension === 'string' ? extension : extension.name,
    );
  };

  it('offers a Variables category, paired by flavour', () => {
    // Paired get/set per type rather than all-gets-then-all-sets: the question
    // a learner arrives with is "how do I keep a vector?", so both blocks for
    // a type should be together when they find it.
    const variables = (
      DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>
    ).find(c => c.name === 'Variables')?.blocks;
    expect(variables).toEqual([
      'variables_get_Number',
      'variables_set_Number',
      'variables_get_Boolean',
      'variables_set_Boolean',
      'variables_get_String',
      'variables_set_String',
      'variables_get_Vector',
      'variables_set_Vector',
      'variables_get_Actor',
      'variables_set_Actor',
    ]);
  });

  it('leaves the actor getter in the Actor category too', () => {
    // Deliberate duplication: the `for each` loop binds an actor variable, and
    // reading it belongs beside the loop that made it as much as in Variables.
    const actor = (
      DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>
    ).find(c => c.name === 'Actor')?.blocks;
    expect(actor).toContain('variables_get_Actor');
  });

  it('guards `use trait`, whose `useTraits` is builder-only', () => {
    expect(extensionsOf('world_use_trait')).toContain(TRAIT_CONTEXT_EXTENSION);
  });

  it('guards `remove effect`, which needs a live actor', () => {
    // `Actor.removeEffect` has no builder counterpart — un-declaring on a
    // template described once means nothing — so under `define actor`, where
    // `actor` is the builder, this would throw.
    expect(extensionsOf('world_remove_effect')).toContain(
      RUNTIME_ACTOR_EXTENSION,
    );
  });

  it('leaves `remove effect from the world` alone under `define world`', () => {
    // It was guarded there, on the grounds that un-declaring something
    // described once means nothing. That was true of a builder accumulating
    // state and false of one recording calls: `add effect` then `remove effect`
    // is a sequence, and replaying it leaves no effect.
    //
    // It still carries `worldContext`, which answers a different question —
    // whether `world` is bound to anything at all.
    expect(extensionsOf('world_remove_world_effect')).toContain(
      WORLD_CONTEXT_EXTENSION,
    );
  });

  it('guards the two blocks that load a map, which need the builder', () => {
    // Neither has a live equivalent: `loadMap` instantiates templates against a
    // type registry the builder owns, and a World has no `define` at all
    // (`builderSurface.test`). Unguarded, one of these in a handler calls a
    // method that is not there.
    for (const type of ['world_load_map', 'world_create_in_map']) {
      expect(extensionsOf(type), type).toContain(BUILDER_WORLD_EXTENSION);
    }
  });

  it('does NOT guard `add actor`, which now spawns at runtime too', () => {
    // It used to be guarded for a good reason: it generates
    // `world.addActor(Template, id, type)` and the live World took an
    // already-made Actor, so in a handler it pushed an ActorBuilder into the
    // actor list and threw nothing — the game just had a thing in it that was
    // not an actor.
    //
    // The World takes the template form now and instantiates it, which is what
    // firing a bullet or splitting an asteroid needs. The guard would only warn
    // a learner off something that works.
    expect(extensionsOf('world_add_actor')).not.toContain(
      BUILDER_WORLD_EXTENSION,
    );
  });

  it('does not double-warn on `create ⟨x⟩ in map`', () => {
    // It carried `worldContext` before. `builderWorld` subsumes it — anywhere
    // `world` is unbound this warns too — so keeping both would put two
    // warnings on one block saying one thing.
    expect(extensionsOf('world_create_in_map')).not.toContain(
      WORLD_CONTEXT_EXTENSION,
    );
  });

  it('guards `any ⟨kind⟩` only where `world` is unbound', () => {
    // Read as a value it compiles to `world.actors.ofType(…)`, so it needs a
    // `world` — caught in the editor rather than as a TypeError on a line the
    // learner never wrote. It does not fire on the case that made this block:
    // plugged into an event hat's subject socket it names the TEMPLATE and
    // touches no world, and a hat counts as binding one.
    expect(extensionsOf('world_actor_kind')).toContain(WORLD_CONTEXT_EXTENSION);
  });

  it('lets the actor-reading blocks sit under `define world`', () => {
    // `load map` then `set actor to follow ⟨camera⟩` ← `first actor of type
    // ⟨Player⟩` is the program this is for. It warned before, correctly: the
    // builder had no `actors`, so the call was a TypeError. It has them now —
    // it hands back the actors of the world it is describing — so the warning
    // would be about a program that works, which is worse than none.
    for (const type of [
      'world_actor_kind',
      'world_all_actors',
      'world_remove_actor',
      'world_clear_world',
      'world_remove_world_effect',
    ]) {
      expect(extensionsOf(type), type).not.toContain('world_needs_live_world');
    }
  });

  it('leaves `add effect` alone, because `addEffect` exists on both', () => {
    // The same reasoning as the `set` blocks below, and the reason there is no
    // separate `use effect`: `ActorBuilder.addEffect` and `Actor.addEffect`
    // agree, so this one block is valid as a template default AND at runtime.
    // Guarding it either way would warn about correct programs.
    const names = extensionsOf('world_add_effect');
    expect(names).not.toContain(RUNTIME_ACTOR_EXTENSION);
    expect(names).not.toContain(TRAIT_CONTEXT_EXTENSION);

    const worldNames = extensionsOf('world_add_world_effect');
    // …but `world` must still be bound to something.
    expect(worldNames).toContain(WORLD_CONTEXT_EXTENSION);
  });

  it('leaves the `set` blocks alone, because `set` exists on both', () => {
    // `set sprite` and `set position` emit `target.set(Property, value)`, and
    // both `ActorBuilder` and `Actor` have `set`. They are legitimately valid
    // as a template default AND at runtime, so a guard here would warn about
    // correct programs.
    for (const type of ['world_set_sprite', 'world_set_position']) {
      const names = extensionsOf(type);
      expect(names).not.toContain(RUNTIME_ACTOR_EXTENSION);
      expect(names).not.toContain(TRAIT_CONTEXT_EXTENSION);
    }
  });
});

describe('what an actor list’s source socket wears', () => {
  // `all actors` is almost never the list somebody wanted; it was the default
  // because it was the only list there was. `any ⟨Coin ▾⟩` is one dropdown
  // click from what a learner meant, where a learner is the one holding it.
  const LIST_BLOCKS = [
    'world_for_each',
    'world_filter_actors',
    'world_ordered_actors',
    'world_extreme_actor',
  ];

  /** A stand-in workspace holding one top block of the given type. */
  const workspaceWith = (type: string) =>
    ({
      getTopBlocks: () => [{type}],
    }) as never;

  const sourceShadow = (blockType: string, rootType: string) => {
    const entry = shadowsFor(blockType)?.find(s => s.name === 'SOURCE');
    return shadowFor(entry!.shadow, {
      workspace: workspaceWith(rootType),
    } as never);
  };

  it('offers a kind to pick from in a world or an actor file', () => {
    for (const type of LIST_BLOCKS) {
      expect(sourceShadow(type, 'world_world')).toEqual({
        type: 'world_actor_kind',
      });
      expect(sourceShadow(type, 'world_actor')).toEqual({
        type: 'world_actor_kind',
      });
    }
  });

  it('offers every actor in a rule, which may not name a kind', () => {
    // Not a preference: a rule is generic over the actors that elect its
    // traits, and the dropdown there would offer a rule author precisely the
    // thing they must not name (specs/ACTOR_LISTS.md).
    for (const type of LIST_BLOCKS) {
      expect(sourceShadow(type, 'world_rule')).toEqual({
        type: 'world_all_actors',
      });
    }
  });

  it('leaves the wrapping blocks on `all actors`', () => {
    // What goes in these is almost always another list block rather than a
    // kind, so the shadow is replaced by a drag either way and the broader
    // default costs nothing.
    for (const type of ['world_first_actor', 'world_take_actors']) {
      const entry = shadowsFor(type)?.find(s => s.name === 'SOURCE');
      expect(entry?.shadow).toEqual({type: 'world_all_actors'});
    }
  });
});

describe('a vector and its polar halves', () => {
  // Nothing turned a direction into an angle before these — no arctangent, no
  // angle-of-a-vector — so `turn to face ⟨actor⟩` could not be written at all
  // and the Steering rule shipped without it.
  it('world_vector_length asks how long', () => {
    expect(emitValue('world_vector_length', {}, {VECTOR: 'v'})[0]).toBe(
      'v.length()',
    );
  });

  it('world_vector_direction asks which way', () => {
    expect(emitValue('world_vector_direction', {}, {VECTOR: 'v'})[0]).toBe(
      'v.angle()',
    );
  });

  it('world_vector_from_angle makes one from the two', () => {
    // Length then angle, because that is the order the sentence wants — "5 in
    // direction 90" — while the engine takes the angle first.
    expect(
      emitValue('world_vector_from_angle', {}, {LENGTH: '5', DEGREES: '90'})[0],
    ).toBe('WorldLab.Vector.fromAngle(90, 5)');
  });

  it('stands in for an empty socket rather than emitting nothing', () => {
    // An unplugged vector socket is `(0, 0)`, as the sibling vector blocks
    // already treat one; an unplugged length is 1, so the block answers a
    // direction rather than a point.
    expect(emitValue('world_vector_length')[0]).toBe(
      'new WorldLab.Vector(0, 0).length()',
    );
    expect(emitValue('world_vector_from_angle')[0]).toBe(
      'WorldLab.Vector.fromAngle(0, 1)',
    );
  });
});

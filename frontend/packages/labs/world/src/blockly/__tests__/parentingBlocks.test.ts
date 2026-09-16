// The blocks parenting adds (specs/PARENTING.md, "The blocks").
//
// `parent of`, `set parent of … to` and the four event hats are minted from
// the Space rule like any built-in member; what is hand-made is the local
// transform and `children of`. Pinned here: what each generates, that the
// palette offers them all under Space, and that a project written with them
// puts a child where the engine says.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {buildDomainPalette, DOMAIN_BLOCKS} from '../domainBlocks';
import type {FileKind} from '../fileKind';

/** Run a block's generator with chosen blocks plugged into its sockets. */
const emit = (
  type: string,
  plugged: string | null,
  values: Record<string, string> = {},
): string | [string, number] => {
  const definition = DOMAIN_BLOCKS.find(block => block.type === type)!;
  return definition.generator.javascript(
    {
      getFieldValue: () => null,
      getInputTargetBlock: (name: string) =>
        name === 'ACTOR' && plugged ? {type: plugged} : null,
    } as never,
    {
      definitions_: {},
      valueToCode: (_block: unknown, name: string) => values[name] ?? '',
      getVariableName: (id: string) => id,
    } as never,
    {} as never,
  ) as string | [string, number];
};

const ONE = 'world_this_actor';
const KIND = 'world_actor_kind';

describe('what the local transform blocks generate', () => {
  it('stores a local position unconverted', () => {
    expect(
      emit('world_set_local_position', ONE, {ACTOR: 'actor', X: '60', Y: '30'}),
    ).toBe(
      'actor.setLocal(WorldLab.PositionProperty, new WorldLab.Vector(60, 30));\n',
    );
  });

  it('reads the local position of one actor, the first of several', () => {
    expect(emit('world_local_position', ONE, {ACTOR: 'actor'})).toEqual([
      'actor.local(WorldLab.PositionProperty)',
      expect.any(Number),
    ]);
    expect(
      emit('world_local_position', KIND, {ACTOR: 'world.actors.ofType("a")'}),
    ).toEqual([
      'WorldLab.one(world.actors.ofType("a")).local(WorldLab.PositionProperty)',
      expect.any(Number),
    ]);
  });

  it('turns and scales in the parent’s frame', () => {
    expect(
      emit('world_set_local_rotation', ONE, {ACTOR: 'actor', DEGREES: '45'}),
    ).toBe('actor.setLocal(WorldLab.RotationProperty, 45);\n');
    expect(
      emit('world_set_local_scale', ONE, {ACTOR: 'actor', X: '2', Y: '0.5'}),
    ).toBe(
      'actor.setLocal(WorldLab.ScaleProperty, new WorldLab.Vector(2, 0.5));\n',
    );
    expect(emit('world_local_rotation', ONE, {ACTOR: 'actor'})).toEqual([
      'actor.local(WorldLab.RotationProperty)',
      expect.any(Number),
    ]);
    expect(emit('world_local_scale', ONE, {ACTOR: 'actor'})).toEqual([
      'actor.local(WorldLab.ScaleProperty)',
      expect.any(Number),
    ]);
  });

  it('answers the children as a list the list blocks can take', () => {
    expect(emit('world_children_of', ONE, {ACTOR: 'actor'})).toEqual([
      '[...actor.children()]',
      expect.any(Number),
    ]);
  });
});

describe('the palette', () => {
  const spaceBlocks = (fileKind: FileKind): string[] => {
    const {toolbox} = buildDomainPalette([], {fileKind});
    const space = (toolbox as Array<{name: string; blocks?: unknown[]}>).find(
      category => category.name === 'Space',
    );
    return (space?.blocks ?? []).filter(
      (item): item is string => typeof item === 'string',
    );
  };

  it('offers parenting under Space, in an actor file and in a world', () => {
    for (const kind of ['actor', 'world'] as const) {
      const offered = spaceBlocks(kind);
      for (const type of [
        'world_set_Space_ParentProperty',
        'world_get_Space_ParentProperty',
        'world_set_local_position',
        'world_local_position',
        'world_set_local_rotation',
        'world_local_rotation',
        'world_set_local_scale',
        'world_local_scale',
        'world_children_of',
        'world_on_Space_GotParentEvent',
        'world_on_Space_LostParentEvent',
        'world_on_Space_GainedChildEvent',
        'world_on_Space_LostChildEvent',
      ]) {
        expect(offered, `${type} in a ${kind}`).toContain(type);
      }
    }
  });
});

describe('a project that parents one actor to another', () => {
  /** `any ⟨kind⟩`, `this actor`, a number. */
  const kind = (path: string) => ({
    block: {type: 'world_actor_kind', fields: {ACTOR: path}},
  });
  const me = () => ({block: {type: 'world_this_actor'}});
  const number = (value: number) => ({
    block: {type: 'math_number', fields: {NUM: value}},
  });
  const chain = (rows: object[]) =>
    rows.reduceRight((next, row) => ({...row, next: {block: next}}));

  /** The Interface Kit's actors, under a world that parents a Button. */
  const project = () => {
    const source = WORLD_SCENARIOS.interface.source;
    const main = Object.values(source.files).find(
      file => file.name === 'main.world',
    )!;
    const world = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            fields: {NAME: 'Nested'},
            next: {
              block: chain([
                {
                  type: 'world_add_actor',
                  fields: {ACTOR: 'actors/label'},
                  inputs: {
                    DO: {
                      block: {
                        type: 'world_set_position',
                        inputs: {ACTOR: me(), X: number(100), Y: number(100)},
                      },
                    },
                  },
                },
                {
                  type: 'world_add_actor',
                  fields: {ACTOR: 'actors/button'},
                  inputs: {
                    DO: {
                      block: chain([
                        {
                          type: 'world_set_Space_ParentProperty',
                          inputs: {ACTOR: me(), VALUE: kind('actors/label')},
                        },
                        {
                          type: 'world_set_local_position',
                          inputs: {
                            ACTOR: me(),
                            X: number(60),
                            Y: number(30),
                          },
                        },
                      ]),
                    },
                  },
                },
              ]),
            },
          },
        ],
      },
    });
    return {
      ...source,
      files: {...source.files, [main.id]: {...main, contents: world}},
    };
  };

  it('puts the child where the engine says: parent plus local', async () => {
    const {world} = await compileProject(projectFiles(project()));
    const actors = [...world.actors];
    const label = actors.find(actor => actor.type === 'actors/label')!;
    const button = actors.find(actor => actor.type === 'actors/button')!;
    expect(button.parent()).toBe(label);
    expect(label.children()).toEqual([button]);
    const position = button.get(
      (await import('../../engine/rules/spatial')).PositionProperty,
    );
    expect([position.x, position.y]).toEqual([160, 130]);
  });
});

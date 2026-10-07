// "Any Coin", and where a handler for it has to be registered.
//
// As a value, `any ⟨Coin⟩` is the coins there are. A handler's own `any
// ⟨kind⟩` is a field on the event block, not this block, and is tested with
// it (`eventSubject`).

import {describe, expect, it} from 'vitest';

import {actorInputExtension} from '../actorInput';
import {assembleWorldModule} from '../assembleActorModule';
import {DOMAIN_BLOCKS} from '../domainBlocks';

/** A stand-in workspace: the top blocks, and lookup by id. */
const workspace = (
  blocks: Array<{id: string; type: string; name?: string}>,
) => {
  const made = blocks.map(block => ({
    id: block.id,
    type: block.type,
    getFieldValue: (field: string) =>
      field === 'NAME' ? (block.name ?? '') : undefined,
  }));
  return {
    getTopBlocks: () => made,
    getBlockById: (id: string) => made.find(block => block.id === id) ?? null,
  };
};

const WORLD = () =>
  workspace([{id: 'w1', type: 'world_world', name: 'Platform World'}]);

/**
 * Generate the block, as plugged into `parentType`.
 *
 * Which socket it sits in decides which of its two compilations it gets: a
 * handler's subject socket wants the template, everything else wants the
 * actors (specs/ACTOR_LISTS.md).
 */
const emitValue = (
  fields: Record<string, string>,
  space: unknown = WORLD(),
  parentType = 'world_set_position',
): {code: string; imports: string[]} => {
  const definition = DOMAIN_BLOCKS.find(b => b.type === 'world_actor_kind')!;
  const definitions: Record<string, string> = {};
  const result = definition.generator.javascript(
    {
      id: 'k1',
      workspace: space,
      getFieldValue: (name: string) => fields[name],
      outputConnection: {
        targetConnection: {getSourceBlock: () => ({type: parentType})},
      },
    } as never,
    {definitions_: definitions} as never,
    {} as never,
  ) as [string, number];
  return {code: result[0], imports: Object.keys(definitions)};
};

describe('any <kind>, anywhere else', () => {
  it('is the actors of that kind, there and then', () => {
    // What a statement acts on and a value reads. Nothing is imported: the
    // world stamps each placed actor with its type, and a type is a string.
    const {code, imports} = emitValue({ACTOR: 'actors/coin'});

    expect(code).toBe('world.actors.ofType("actors/coin")');
    expect(imports).toEqual([]);
  });

  it('names no actors at all when it names nothing', () => {
    expect(emitValue({ACTOR: ''}).code).toBe('[]');
  });
});

describe('assembleWorldModule', () => {
  it('registers handlers before the world places anything', () => {
    // `ActorBuilder.instantiate` copies the handlers a template has WHEN it
    // makes an instance. A hat below the world block would register onto a
    // template every actor had already been made from: it would compile, run,
    // and never fire.
    const code = assembleWorldModule([
      {type: 'world_world', code: 'const world = mk();\nworld.loadMap(m);\n'},
      {type: 'world_on_startsFalling', code: 'ActorsCoin.on(E, h);\n'},
    ]);

    expect(code).toBe(
      'ActorsCoin.on(E, h);\n' +
        'const world = mk();\nworld.loadMap(m);\n' +
        'export default world;\n',
    );
  });
});

describe('an action’s ACTOR socket default', () => {
  /** Apply an extension to a block in a given workspace, and read the shadow. */
  const shadowIn = (extension: unknown, space: unknown): string | undefined => {
    let shadow: {type?: string} | undefined;
    const block = {
      workspace: space,
      getInput: () => ({
        connection: {
          targetBlock: () => null,
          setShadowState: (state: {type?: string}) => {
            shadow = state;
          },
        },
      }),
    };
    (extension as {extension(this: unknown): void}).extension.call(block);
    return shadow?.type;
  };

  const ACTOR_FILE = () => workspace([{id: 'a1', type: 'world_actor'}]);

  it('is `this actor` on an action, whatever the file', () => {
    // An action acts on ONE actor, and inside a handler that is the instance
    // the event was delivered to. Defaulting these to the kind would read as
    // "hide every coin" where the learner wrote "hide this actor".
    expect(shadowIn(actorInputExtension, ACTOR_FILE())).toBe(
      'world_this_actor',
    );
    expect(shadowIn(actorInputExtension, WORLD())).toBe('world_this_actor');
  });

  it('asks the workspace a flyout block would be dragged into', () => {
    const flyout = {...workspace([]), isFlyout: true, targetWorkspace: WORLD()};

    expect(shadowIn(actorInputExtension, flyout)).toBe('world_this_actor');
  });
});

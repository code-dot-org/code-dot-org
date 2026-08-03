// "Any Coin", and where a handler for it has to be registered.
//
// An `.actor` file is about one actor, so `this actor` is the subject and the
// socket says so. A `.world` file names several and binds no principal one, so
// the subject is a KIND — every actor of it, placed now or later — which
// resolves to the template, because a template takes the same messages its
// instances do.

import {describe, expect, it} from 'vitest';

import {actorInputExtension} from '../actorInput';
import {assembleWorldModule} from '../assembleActorModule';
import {DOMAIN_BLOCKS} from '../domainBlocks';
import {localActorValue, localActorVar} from '../localActors';

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
  workspace([
    {id: 'w1', type: 'world_world', name: 'Platform World'},
    {id: 'a1', type: 'world_actor', name: 'Coin'},
  ]);

const emitValue = (
  fields: Record<string, string>,
  space: unknown = WORLD(),
): {code: string; imports: string[]} => {
  const definition = DOMAIN_BLOCKS.find(b => b.type === 'world_actor_kind')!;
  const definitions: Record<string, string> = {};
  const result = definition.generator.javascript(
    {
      id: 'k1',
      workspace: space,
      getFieldValue: (name: string) => fields[name],
    } as never,
    {definitions_: definitions} as never,
    {} as never,
  ) as [string, number];
  return {code: result[0], imports: Object.keys(definitions)};
};

describe('any <kind>', () => {
  it('is the world’s own actor, by the variable that holds its template', () => {
    const {code, imports} = emitValue({ACTOR: localActorValue('a1')});

    expect(code).toBe(localActorVar('Coin', 'a1'));
    expect(imports).toEqual([]);
  });

  it('is a module actor, imported like anything else that names one', () => {
    const {code, imports} = emitValue({ACTOR: 'actors/coin'});

    expect(code).toBe('Coin');
    expect(imports).toEqual(['mod:actors/coin']);
  });

  it('falls back to the subject when it names nothing', () => {
    // Nothing chosen, or a `define actor` deleted out from under it: better the
    // block's own subject than a variable no line declares.
    expect(emitValue({ACTOR: ''}).code).toBe('actor');
    expect(emitValue({ACTOR: localActorValue('gone')}).code).toBe('actor');
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
      {type: 'world_on_startsFalling', code: 'actor_Coin_a1.on(E, h);\n'},
      {type: 'world_actor', code: 'const actor_Coin_a1 = mkActor();\n'},
    ]);

    expect(code).toBe(
      'const localActors = {};\n' +
        'const actor_Coin_a1 = mkActor();\n' +
        'actor_Coin_a1.on(E, h);\n' +
        'const world = mk();\nworld.loadMap(m);\n' +
        'export default world;\nexport {localActors};\n',
    );
  });
});

describe('the ACTOR socket’s default', () => {
  /** Apply the extension to a block in a given workspace, and read the shadow. */
  const shadowIn = (space: unknown): string | undefined => {
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
    (
      actorInputExtension as unknown as {extension(this: unknown): void}
    ).extension.call(block);
    return shadow?.type;
  };

  it('is `this actor` in an actor file', () => {
    // One actor, and the file is about it.
    expect(shadowIn(workspace([{id: 'a1', type: 'world_actor'}]))).toBe(
      'world_this_actor',
    );
  });

  it('is `any <kind>` in a world file', () => {
    // Several actors and no principal one — `actor` is not even bound there.
    expect(shadowIn(WORLD())).toBe('world_actor_kind');
  });

  it('asks the workspace a flyout block would be dragged into', () => {
    const flyout = {...workspace([]), isFlyout: true, targetWorkspace: WORLD()};

    expect(shadowIn(flyout)).toBe('world_actor_kind');
  });
});

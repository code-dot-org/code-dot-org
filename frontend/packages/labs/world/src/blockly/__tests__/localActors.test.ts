// Actors defined inside a `.world` file.
//
// The same `define actor` block, in a file that is a world rather than an
// actor: it builds a template the world places and nobody else can reach. What
// has to be true is that the three blocks involved agree — the definition emits
// a variable, `add actor` names that variable and stamps the type, and `is a`
// asks about the same type string — and that none of it changes what a `.actor`
// file generates.

import {describe, expect, it} from 'vitest';

import {assembleWorldModule} from '../assembleActorModule';
import {DOMAIN_BLOCKS} from '../domainBlocks';
import {
  localActorOptions,
  localActorValue,
  localActorVar,
} from '../localActors';

/** A stand-in for a workspace: the top blocks, and lookup by id. */
const workspace = (
  blocks: Array<{id: string; type: string; name?: string}>,
  extra: {isFlyout?: boolean; targetWorkspace?: unknown} = {},
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
    ...extra,
  };
};

/** Run a block's generator against a given workspace. */
const emit = (
  type: string,
  fields: Record<string, string>,
  space: unknown,
  {id = 'b1', next = '', statements = {} as Record<string, string>} = {},
): string => {
  const definition = DOMAIN_BLOCKS.find(block => block.type === type);
  if (!definition) {
    throw new Error(`no domain block '${type}'`);
  }
  const nextBlock = next ? {} : null;
  const block = {
    id,
    workspace: space,
    getFieldValue: (name: string) => fields[name],
    getNextBlock: () => nextBlock,
  };
  const generator = {
    definitions_: {} as Record<string, string>,
    statementToCode: (_block: unknown, name: string) => statements[name] ?? '',
    valueToCode: () => '',
    blockToCode: (b: unknown) => (b === nextBlock && next ? next : ''),
  };
  const code = definition.generator.javascript(
    block as never,
    generator as never,
    {} as never,
  );
  return (Array.isArray(code) ? code[0] : code) as string;
};

/** The same, reporting what the generator asked to have imported. */
const emitWithImports = (
  type: string,
  fields: Record<string, string>,
  space: unknown,
  id = 'b1',
): {code: string; imports: string[]} => {
  const definition = DOMAIN_BLOCKS.find(block => block.type === type)!;
  const definitions: Record<string, string> = {};
  const code = definition.generator.javascript(
    {
      id,
      workspace: space,
      getFieldValue: (name: string) => fields[name],
      getNextBlock: () => null,
    } as never,
    {
      definitions_: definitions,
      statementToCode: () => '',
      valueToCode: () => '',
      blockToCode: () => '',
    } as never,
    {} as never,
  ) as string;
  return {code, imports: Object.keys(definitions)};
};

const WORLD = () =>
  workspace([
    {id: 'w1', type: 'world_world', name: 'Platform World'},
    {id: 'a1', type: 'world_actor', name: 'Coin'},
  ]);

describe('define actor in a world file', () => {
  it('builds a named template, and runs its body against it', () => {
    const code = emit('world_actor', {NAME: 'Coin'}, WORLD(), {
      id: 'a1',
      next: 'actor.useTraits([X]);\n',
    });

    // A variable of its own, so a world may define several — and its body still
    // speaks of `actor`, so every block that can sit under `define actor`
    // generates the same code in either kind of file.
    expect(code).toContain(
      `const ${localActorVar('Coin', 'a1')} = new WorldLab.ActorBuilder({id: "Coin", name: "Coin"});`,
    );
    expect(code).toContain(`const actor = ${localActorVar('Coin', 'a1')};`);
    expect(code).toContain('actor.useTraits([X]);');
    // Nothing is exported: the actor is this world's and no other file's.
    expect(code).not.toContain('export');
  });

  it('hands itself to the module, under the type a placement carries', () => {
    // How anything outside the world reaches an actor that is not a module:
    // the module exports what it collected (MAPS.md §5), and the map editor's
    // inspector introspects it from there.
    const code = emit('world_actor', {NAME: 'Coin Purse'}, WORLD(), {id: 'a1'});

    expect(code).toContain(
      `localActors["Coin_Purse"] = ${localActorVar('Coin Purse', 'a1')};`,
    );
  });

  it('leaves an .actor file generating exactly what it did', () => {
    // No `world_world` in the workspace, so this is a module's actor.
    const code = emit(
      'world_actor',
      {NAME: 'Player'},
      workspace([{id: 'a1', type: 'world_actor', name: 'Player'}]),
      {next: 'actor.useTraits([X]);\n'},
    );

    expect(code).toBe(
      'const actor = new WorldLab.ActorBuilder({id: "Player", name: "Player"});\n' +
        'actor.useTraits([X]);\n',
    );
    // And nothing about the world's registry, which that file has none of.
    expect(code).not.toContain('localActors');
  });

  it('tells two actors of the same name apart', () => {
    // "Actor" is the block's default text, so a world with two of them is the
    // ordinary case, not a corner one.
    expect(localActorVar('Actor', 'a1')).not.toBe(localActorVar('Actor', 'a2'));
  });
});

describe('placing a world’s own actor', () => {
  it('names the variable and imports nothing', () => {
    const {code, imports} = emitWithImports(
      'world_add_actor',
      {ACTOR: localActorValue('a1')},
      WORLD(),
      'p1',
    );

    expect(code).toContain(
      `world.addActor(${localActorVar('Coin', 'a1')}, "p1", "Coin")`,
    );
    // There is no module to import — that is the whole point of a local actor.
    expect(imports).toEqual([]);
  });

  it('still imports a module actor', () => {
    const {code, imports} = emitWithImports(
      'world_add_actor',
      {ACTOR: 'actors/coin'},
      WORLD(),
      'p1',
    );

    expect(code).toContain('"actors/coin"');
    expect(imports).toEqual(['mod:actors/coin']);
  });

  it('emits nothing for a definition that has been deleted', () => {
    // The `add actor` block outlives the `define actor` it names. A reference
    // to a variable no line declares would not compile, over a block the
    // learner can plainly see is unfinished.
    const code = emit(
      'world_add_actor',
      {ACTOR: localActorValue('gone')},
      WORLD(),
    );

    expect(code).toBe('');
  });

  it('asks `is a` about the type the placement stamped', () => {
    const code = emit('world_is_a', {TYPE: localActorValue('a1')}, WORLD());

    expect(code).toBe('actor.type === "Coin"');
  });
});

describe('the ACTOR dropdown', () => {
  it('offers the world’s own actors, by name, keyed by definition', () => {
    const field = {getSourceBlock: () => ({workspace: WORLD()})};

    // The value is the defining block's id: renaming the actor keeps every
    // `add actor` pointing at the same definition.
    expect(localActorOptions(field as never)).toEqual([
      ['Coin', localActorValue('a1')],
    ]);
  });

  it('asks the workspace a flyout block would be dragged into', () => {
    const target = WORLD();
    const field = {
      getSourceBlock: () => ({
        workspace: workspace([], {isFlyout: true, targetWorkspace: target}),
      }),
    };

    expect(localActorOptions(field as never)).toEqual([
      ['Coin', localActorValue('a1')],
    ]);
  });

  it('offers none for a file that defines none', () => {
    const field = {getSourceBlock: () => ({workspace: workspace([])})};

    expect(localActorOptions(field as never)).toEqual([]);
  });
});

describe('assembleWorldModule', () => {
  it('declares the world’s actors before the world that places them', () => {
    // Where a definition sits on the canvas must not decide whether it works:
    // `add actor` runs inside the world block's code, so the `const` has to be
    // above it whatever order the blocks were generated in.
    const code = assembleWorldModule([
      {type: 'world_world', code: 'const world = mk();\nplace();\n'},
      {type: 'world_actor', code: 'const actor_Coin_a1 = mkActor();\n'},
    ]);

    expect(code).toBe(
      'const localActors = {};\n' +
        'const actor_Coin_a1 = mkActor();\n' +
        'const world = mk();\nplace();\n' +
        'export default world;\nexport {localActors};\n',
    );
  });
});

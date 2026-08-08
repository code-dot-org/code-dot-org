import {describe, expect, it} from 'vitest';

import {assembleActorModule, assembleWorldModule} from '../assembleActorModule';

describe('assembleActorModule', () => {
  it('emits the actor first, then events, then the default export', () => {
    const code = assembleActorModule([
      {type: 'world_actor', code: 'const actor = mk();\n'},
      {type: 'world_on_startsFalling', code: 'actor.on(A);\n'},
      {type: 'world_on_startsFalling', code: 'actor.on(B);\n'},
    ]);
    expect(code).toBe(
      'const actor = mk();\nactor.on(A);\nactor.on(B);\nexport default actor;\n',
    );
  });

  it('puts the actor first even when an event block comes before it (TDZ-safe)', () => {
    // Blockly orders top blocks by canvas position; an event dragged above the
    // actor must not emit `actor.on(...)` before `const actor`.
    const code = assembleActorModule([
      {type: 'world_on_startsFalling', code: 'actor.on(A);\n'},
      {type: 'world_actor', code: 'const actor = mk();\n'},
    ]);
    expect(code.indexOf('const actor')).toBeLessThan(code.indexOf('actor.on'));
    expect(code).toBe(
      'const actor = mk();\nactor.on(A);\nexport default actor;\n',
    );
  });

  it('still ends with the export when there is no actor block', () => {
    expect(
      assembleActorModule([{type: 'world_on_startsFalling', code: 'x;\n'}]),
    ).toBe('x;\nexport default actor;\n');
  });

  it('emits just the export for an empty workspace', () => {
    expect(assembleActorModule([])).toBe('export default actor;\n');
  });
});

describe('assembleWorldModule', () => {
  it('emits the world block (with its inline rules) then the default export', () => {
    const code = assembleWorldModule([
      {
        type: 'world_world',
        code: 'const world = mk();\nworld.useRules([X]);\n',
      },
    ]);
    // Every world declares and exports `localActors`, defined actors or not:
    // the thumbnail manifest imports it by name, and an export that is only
    // sometimes there is one its importers must ask about first (MAPS.md §5).
    expect(code).toBe(
      'const localActors = {};\n' +
        'const world = mk();\nworld.useRules([X]);\n' +
        'export default world;\nexport {localActors};\n',
    );
  });

  it('puts a WORLD event\u2019s handler after the world exists', () => {
    // `world.on(...)` needs the binding the world block makes. Hoisted above it
    // with the actor handlers, the module threw the moment it was imported —
    // and because esbuild rewrites the `const`, it threw as "Cannot read
    // properties of undefined" rather than as a use-before-declaration.
    const code = assembleWorldModule(
      [
        {
          type: 'world_on_Input_IsPressedEvent',
          code: 'world.on(E, (world, eventValue) => {\n});\n',
        },
        {type: 'world_world', code: 'const world = mk();\n'},
      ],
      new Set(['world_on_Input_IsPressedEvent']),
    );

    expect(code.indexOf('const world = mk();')).toBeLessThan(
      code.indexOf('world.on(E,'),
    );
  });

  it('keeps an ACTOR event\u2019s handler before it', () => {
    // The opposite constraint, and the reason this is a split rather than a
    // move: a template copies its handlers into each instance as it is made, so
    // a hat below the world block would register onto a template every actor
    // had already been made from — it would compile, run, and never fire.
    const code = assembleWorldModule(
      [
        {type: 'world_world', code: 'const world = mk();\n'},
        {
          type: 'world_on_Input_PressesEvent',
          code: 'player.on(E, (actor, eventValue) => {\n});\n',
        },
      ],
      new Set(['world_on_Input_IsPressedEvent']),
    );

    expect(code.indexOf('player.on(E,')).toBeLessThan(
      code.indexOf('const world = mk();'),
    );
  });

  it('treats a hat it was told nothing about as an actor\u2019s', () => {
    // The safe default: an unknown hat keeps the placement every hat had
    // before there was a distinction, so nothing that worked stops working.
    const code = assembleWorldModule([
      {type: 'world_world', code: 'const world = mk();\n'},
      {type: 'world_on_Mystery', code: 'thing.on(E, () => {});\n'},
    ]);

    expect(code.indexOf('thing.on(E,')).toBeLessThan(
      code.indexOf('const world = mk();'),
    );
  });
});

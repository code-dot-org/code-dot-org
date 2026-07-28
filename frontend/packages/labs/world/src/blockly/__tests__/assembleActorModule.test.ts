import {describe, expect, it} from 'vitest';

import {
  assembleActorModule,
  assembleSceneModule,
  assembleWorldModule,
} from '../assembleActorModule';

describe('assembleActorModule', () => {
  it('emits the actor first, then events, then the default export', () => {
    const code = assembleActorModule([
      {type: 'world_actor', code: 'const actor = mk();\n'},
      {type: 'world_on_event', code: 'actor.on(A);\n'},
      {type: 'world_on_event', code: 'actor.on(B);\n'},
    ]);
    expect(code).toBe(
      'const actor = mk();\nactor.on(A);\nactor.on(B);\nexport default actor;\n',
    );
  });

  it('puts the actor first even when an event block comes before it (TDZ-safe)', () => {
    // Blockly orders top blocks by canvas position; an event dragged above the
    // actor must not emit `actor.on(...)` before `const actor`.
    const code = assembleActorModule([
      {type: 'world_on_event', code: 'actor.on(A);\n'},
      {type: 'world_actor', code: 'const actor = mk();\n'},
    ]);
    expect(code.indexOf('const actor')).toBeLessThan(code.indexOf('actor.on'));
    expect(code).toBe(
      'const actor = mk();\nactor.on(A);\nexport default actor;\n',
    );
  });

  it('still ends with the export when there is no actor block', () => {
    expect(assembleActorModule([{type: 'world_on_event', code: 'x;\n'}])).toBe(
      'x;\nexport default actor;\n',
    );
  });

  it('emits just the export for an empty workspace', () => {
    expect(assembleActorModule([])).toBe('export default actor;\n');
  });
});

describe('assembleSceneModule', () => {
  it('emits the scene block (with its inline adds) then the default export', () => {
    const code = assembleSceneModule([
      {type: 'world_scene', code: 'const scene = mk();\n{ add }\n'},
    ]);
    expect(code).toBe('const scene = mk();\n{ add }\nexport default scene;\n');
  });

  it('still ends with the scene export when there is no scene block', () => {
    expect(assembleSceneModule([])).toBe('export default scene;\n');
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
    expect(code).toBe(
      'const world = mk();\nworld.useRules([X]);\nexport default world;\n',
    );
  });
});

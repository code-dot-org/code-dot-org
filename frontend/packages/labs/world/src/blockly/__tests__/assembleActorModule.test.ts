import {describe, expect, it} from 'vitest';

import {assembleActorModule} from '../assembleActorModule';

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

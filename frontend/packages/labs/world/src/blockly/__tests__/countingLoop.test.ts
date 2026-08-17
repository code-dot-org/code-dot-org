// `count with ⟨i⟩ from ⟨⟩ to ⟨⟩ by ⟨⟩` — the loop that hands its body a number.
//
// `for each` walks actors and `repeat` walks nothing, so before this the only
// way to say "nine of these, each a little different" was nine blocks — or nine
// map placements carrying values no editor can set, which is what Tapper did.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../domainBlocks';

/** Generate the loop with these sockets and this body. */
const codeFor = (
  values: Record<string, string>,
  body = 'log(i);\n',
): string => {
  const block = buildDomainPalette([]).blocks.find(
    candidate => candidate.type === 'world_count_with',
  ) as {
    generator: {javascript: (b: unknown, g: unknown, e: unknown) => unknown};
  };
  return String(
    block.generator.javascript(
      {id: 'L1', getFieldValue: () => 'i'},
      {
        getVariableName: (name: string) => name,
        valueToCode: (_b: unknown, name: string) => values[name] ?? '',
        statementToCode: () => body,
        definitions_: {},
      },
      {},
    ),
  );
};

describe('the counting loop', () => {
  it('runs the body once per number, inclusive of the last', () => {
    // Inclusive because a learner writing `from 1 to 3` means three times, and
    // `for each` next to it walks every actor rather than all but one.
    const code = codeFor({FROM: '0', TO: '8', BY: '1'});

    expect(code).toContain('let i = 0');
    expect(code).toContain('i <= 8');
    expect(code).toContain('i += ');
    expect(code).toContain('log(i);');
  });

  it('counts down when the step is negative', () => {
    // The test follows the STEP's sign rather than assuming the first number is
    // the smaller one: a learner who types a negative step means it, and a
    // fixed `<=` would run the body zero times and say nothing about why.
    const code = codeFor({FROM: '10', TO: '1', BY: '-1'});

    expect(code).toContain('> 0 ?');
    expect(code).toContain('i <= 1');
    expect(code).toContain('i >= 1');
  });

  it('never steps by zero, which would not finish', () => {
    // An emptied socket reads as 0, and a loop that never advances is a frozen
    // preview rather than an error anybody can see.
    expect(codeFor({FROM: '0', TO: '5', BY: '0'})).toContain('|| 1');
  });

  it('binds a NUMBER, so the body reads it with a number getter', () => {
    // Blockly's own `controls_for` would mint an untyped variable that no
    // getter in this toolbox can read — the same reason `for each` is ours.
    const block = buildDomainPalette([]).blocks.find(
      candidate => candidate.type === 'world_count_with',
    ) as {args0: Array<{name: string; variableTypes?: string[]}>};

    expect(block.args0[0].name).toBe('VAR');
    expect(block.args0[0].variableTypes).toContain('Number');
  });

  it('is offered beside the loop that walks actors', () => {
    const loops = (
      buildDomainPalette([]).toolbox as Array<{
        name?: string;
        blocks?: unknown[];
      }>
    ).find(category => category.name === 'Loops');

    expect(loops?.blocks).toContain('world_count_with');
    // …and Blockly's own `repeat`, spelled out so its socket arrives filled —
    // a core block carries none of our shadows, and `repeat ⟨⟩ times` is a
    // loop that never runs.
    expect(
      loops?.blocks?.some(
        entry =>
          typeof entry === 'object' &&
          (entry as {type?: string}).type === 'controls_repeat_ext',
      ),
    ).toBe(true);
  });
});

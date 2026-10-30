import askAi from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/askAi';

// A VAR socket holding the given block, or nothing when it is null.
const blockWithVar = (target: {type: string} | null) => ({
  getInput: () => ({connection: {targetBlock: () => target}}),
});

const javascript = {
  blockToCode: () => ['myAnswer', 0],
  valueToCode: () => "'why is the sky blue?'",
};

describe('spritelab2_askAI', () => {
  it('puts the question and the variable on separate rows', () => {
    expect(askAi.definition.message0).toBe('ask AI %1');
    expect(askAi.definition.message1).toBe('for variable %1');
    expect(askAi.definition.args0).toHaveLength(1);
    expect(askAi.definition.args1).toHaveLength(1);
    // Inline inputs would collapse the two rows back into one.
    expect(askAi.definition.inputsInline).toBe(false);
  });

  it('passes the variable a setter rather than its value', () => {
    const code = askAi.generator(
      blockWithVar({type: 'variables_get'}) as never,
      javascript as never
    );
    expect(code).toBe(
      "askAI('why is the sky blue?', 'myAnswer', " +
        'function (val) {myAnswer = val;});\n'
    );
  });

  it('generates nothing without a variable to answer into', () => {
    expect(
      askAi.generator(blockWithVar(null) as never, javascript as never)
    ).toBe('');
  });

  // Anything else in the socket has no name to assign to.
  it('generates nothing when the socket holds some other block', () => {
    expect(
      askAi.generator(
        blockWithVar({type: 'text'}) as never,
        javascript as never
      )
    ).toBe('');
  });

  it('falls back to an empty prompt when none is plugged in', () => {
    const code = askAi.generator(
      blockWithVar({type: 'variables_get'}) as never,
      {
        ...javascript,
        valueToCode: () => '',
      } as never
    );
    expect(code).toContain("askAI('', 'myAnswer'");
  });
});

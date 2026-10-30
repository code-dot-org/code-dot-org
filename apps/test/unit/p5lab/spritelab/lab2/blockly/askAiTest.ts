import askAi from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/askAi';
import whenAiAnswers from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/whenAiAnswers';

// A VAR socket holding the given block, or nothing when it is null.
const blockWithVar = (target: {type: string} | null) => ({
  getInput: () => ({connection: {targetBlock: () => target}}),
});

const javascript = {
  blockToCode: () => ['myAnswer', 0],
  valueToCode: () => "'why is the sky blue?'",
};

describe('spritelab2_askAI', () => {
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

describe('spritelab2_whenAIAnswers', () => {
  it('wraps the blocks below it in a handler', () => {
    const block = {nextConnection: {targetBlock: () => ({})}};
    const code = whenAiAnswers.generator(
      block as never,
      {
        blockToCode: () => 'sayIt();\n',
        prefixLines: (text: string, prefix: string) => prefix + text,
      } as never
    );
    expect(code).toBe('whenAIAnswers(function () {\n  sayIt();\n});\n');
  });

  it('generates an empty handler when nothing hangs below', () => {
    const block = {nextConnection: {targetBlock: () => null}};
    expect(whenAiAnswers.generator(block as never, {} as never)).toBe(
      'whenAIAnswers(function () {\n});\n'
    );
  });
});

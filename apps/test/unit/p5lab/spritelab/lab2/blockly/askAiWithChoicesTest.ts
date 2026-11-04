import askAiWithChoices from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/askAiWithChoices';

const blockWithVar = (target: {type: string} | null) => ({
  getInput: () => ({connection: {targetBlock: () => target}}),
});

const VALUES: Record<string, string> = {
  PROMPT: "'is a whale a fish?'",
  CHOICE1: "'yes'",
  CHOICE2: "'no'",
  CHOICE3: '',
};

const javascript = {
  blockToCode: () => ['myAnswer', 0],
  valueToCode: (_block: unknown, name: string) => VALUES[name],
};

describe('spritelab2_askAIWithChoices', () => {
  it('puts the question, the choices and the variable on separate rows', () => {
    const {definition} = askAiWithChoices;
    expect(definition.message0).toBe('ask AI %1');
    expect(definition.message1).toBe('with answer choices %1 %2 %3');
    expect(definition.message2).toBe('for variable %1');
    expect(definition.inputsInline).toBe(false);
  });

  it('passes every choice, empty ones as empty strings', () => {
    const code = askAiWithChoices.generator(
      blockWithVar({type: 'variables_get'}) as never,
      javascript as never
    );
    expect(code).toBe(
      "askAIWithChoices('is a whale a fish?', 'myAnswer', 'yes', 'no', '', " +
        'function (val) {myAnswer = val;});\n'
    );
  });

  it('does not let a variable named val shadow itself', () => {
    const code = askAiWithChoices.generator(
      blockWithVar({type: 'variables_get'}) as never,
      {...javascript, blockToCode: () => ['val', 0]} as never
    );
    expect(code).toContain('function (__val) {val = __val;}');
  });

  it('generates nothing without a variable to answer into', () => {
    expect(
      askAiWithChoices.generator(
        blockWithVar(null) as never,
        javascript as never
      )
    ).toBe('');
  });
});

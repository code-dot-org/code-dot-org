import askAiWithChoices from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/askAiWithChoices';

const blockWithVar = (target: {type: string}) => ({
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
});

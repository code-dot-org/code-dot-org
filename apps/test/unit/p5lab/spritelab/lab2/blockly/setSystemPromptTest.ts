import setSystemPrompt from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/setSystemPrompt';

describe('spritelab2_setSystemPrompt', () => {
  it('sets the system prompt to the plugged-in text', () => {
    const javascript = {valueToCode: () => "'Talk like a pirate.'"};
    expect(setSystemPrompt.generator({} as never, javascript as never)).toBe(
      "setSystemPrompt('Talk like a pirate.');\n"
    );
  });

  it('falls back to an empty prompt when none is plugged in', () => {
    const javascript = {valueToCode: () => ''};
    expect(setSystemPrompt.generator({} as never, javascript as never)).toBe(
      "setSystemPrompt('');\n"
    );
  });
});

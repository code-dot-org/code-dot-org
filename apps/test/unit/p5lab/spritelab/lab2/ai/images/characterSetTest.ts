import {basePrompt} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';

describe('characterSet prompts', () => {
  it('asks for the character drawn once, not as a sheet', () => {
    const text = basePrompt(
      'A friendly witch',
      'pixel',
      {name: 'magenta', hex: '#ff00ff', rgb: [255, 0, 255]},
      16
    );
    expect(text).toMatch(/Draw it once: a single figure, not a sprite sheet/);
    expect(text).toMatch(/^A friendly witch\. Show the whole character/);
  });
});

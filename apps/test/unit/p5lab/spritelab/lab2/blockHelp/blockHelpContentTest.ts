import {BLOCK_HELP} from '@cdo/apps/p5lab/spritelab/lab2/blockHelp/blockHelpContent';
import blockDefinitions from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions';

describe('BLOCK_HELP', () => {
  const defined = new Set(
    Object.values(blockDefinitions).map(entry => entry.definition.type)
  );

  it('names blocks this lab defines, or classic sprite blocks', () => {
    Object.keys(BLOCK_HELP).forEach(type => {
      expect(defined.has(type) || type.startsWith('gamelab_')).toBe(true);
    });
  });

  it('gives every entry an animation', () => {
    Object.values(BLOCK_HELP).forEach(help => {
      expect(help.animation?.src).toBeTruthy();
      expect(help.animation?.alt.trim()).not.toBe('');
    });
  });

  it('gives every entry a title and a one-sentence summary', () => {
    Object.values(BLOCK_HELP).forEach(help => {
      expect(help.title.trim()).not.toBe('');
      expect(help.summary.trim()).toMatch(/\.$/);
    });
  });

  it('keeps a body to one sentence of markdown', () => {
    Object.values(BLOCK_HELP).forEach(help => {
      if (help.body) {
        expect(help.body.trim()).toMatch(/\.$/);
        expect(help.body).not.toMatch(/<\w+>/);
      }
    });
  });
});

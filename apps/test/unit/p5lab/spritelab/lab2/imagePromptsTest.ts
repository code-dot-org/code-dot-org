import {
  canBeTransparent,
  fullPromptFor,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imagePrompts';

describe('fullPromptFor', () => {
  it('asks a sprite for a key color by default', () => {
    const text = fullPromptFor('a knight', {imageType: 'sprite'});
    expect(text).toMatch(/^a knight\. /);
    expect(text).toContain('one single flat color');
    expect(text).not.toContain('transparent');
  });

  it('asks a sprite or block for transparency when asked to', () => {
    for (const imageType of ['sprite', 'block'] as const) {
      const text = fullPromptFor('a knight', {
        imageType,
        style: 'pixel',
        transparent: true,
      });
      expect(text).toContain('fully transparent');
      expect(text).not.toContain('flat color');
      expect(text).toContain('No writing');
    }
  });

  it('keeps the rest of a transparent prompt', () => {
    const character = fullPromptFor('a knight', {
      imageType: 'sprite',
      subject: 'character',
      transparent: true,
    });
    expect(character).toContain('faces to the right');
    const block = fullPromptFor('gold', {
      imageType: 'block',
      transparent: true,
    });
    expect(block).toContain('solid ground in a side-view platform game');
  });

  it('never asks a background for transparency', () => {
    expect(canBeTransparent('background')).toBe(false);
    expect(
      fullPromptFor('a forest', {imageType: 'background', transparent: true})
    ).toEqual(fullPromptFor('a forest', {imageType: 'background'}));
  });
});

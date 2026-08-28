import {describe, expect, it} from 'vitest';

import {stripMarkdownToText} from '../MatchLevel';

describe('stripMarkdownToText', () => {
  it('uses an image alt text as the accessible name', () => {
    expect(stripMarkdownToText('![a fish](https://images.code.org/fish.png)')).toBe(
      'a fish',
    );
  });

  it('returns an empty string for an image with no alt text', () => {
    expect(stripMarkdownToText('![](https://images.code.org/fish.png)')).toBe('');
  });

  it('unwraps a link to its text', () => {
    expect(stripMarkdownToText('[a fish](https://example.com)')).toBe('a fish');
  });

  it('strips emphasis and code markers', () => {
    expect(stripMarkdownToText('**a** *fish* `swims`')).toBe('a fish swims');
  });

  it('leaves plain text untouched', () => {
    expect(stripMarkdownToText('a fish')).toBe('a fish');
  });
});

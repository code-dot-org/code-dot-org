// An answer, as prose.
//
// Asserted whole, for the reason the context string is: the headings and their
// spacing are what a student reads, and they were chosen rather than fallen
// into.

import {describe, expect, it} from 'vitest';

import {formatAnswer, formatProposalText} from '../format';

describe('formatAnswer', () => {
  it('lays the sections out in the legacy order and spacing', () => {
    expect(
      formatAnswer({
        answerType: 'example',
        assumptions: 'you meant circles',
        code: [{filename: 'main.js', sourceCode: 'circle();'}],
        explanation: 'this draws one',
        nextSteps: '- try two',
      }),
    ).toBe(
      '**Assumptions**\n\nyou meant circles\n\n' +
        '**Code**\n\n`main.js`\n```\ncircle();\n```\n\n' +
        '**Explanation**\n\nthis draws one\n\n' +
        '**Next Steps**\n\n- try two\n\n',
    );
  });

  it('names the file each fence belongs in', () => {
    // The whole point of the copy-paste path: the student is moving this
    // across by hand and needs to know where it goes.
    const out = formatAnswer({
      answerType: 'example',
      code: [
        {filename: 'index.html', sourceCode: '<p>'},
        {filename: 'style.css', sourceCode: 'p {}'},
      ],
    });

    expect(out).toContain('`index.html`\n```\n<p>\n```');
    expect(out).toContain('`style.css`\n```\np {}\n```');
  });

  it('omits a section it has nothing for', () => {
    expect(formatAnswer({answerType: 'hint', explanation: 'try a loop'})).toBe(
      '**Explanation**\n\ntry a loop\n\n',
    );
  });

  it('is empty for an answer that said nothing', () => {
    expect(formatAnswer({answerType: 'refusal'})).toBe('');
  });

  it('puts the video last', () => {
    const out = formatAnswer({
      answerType: 'example',
      explanation: 'here',
      videoUrl: 'https://example.com/v',
    });

    expect(out.endsWith('\n[Watch this video](https://example.com/v)\n')).toBe(
      true,
    );
  });
});

describe('formatProposalText', () => {
  it('leaves the code out, because the chips already show it', () => {
    // Otherwise the same content appears twice, once unreadably.
    const out = formatProposalText({
      answerType: 'buildJavaScript',
      explanation: 'moved it into a loop',
      code: [{filename: 'main.js', sourceCode: 'for (;;) {}'}],
    });

    expect(out).toBe('**Explanation**\n\nmoved it into a loop\n\n');
    expect(out).not.toContain('for (;;)');
  });
});

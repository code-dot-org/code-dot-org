// The recorded conversation the standalone harness uses.
//
// It is JSON with nothing between the author and the failure, and the failure
// it produces unchecked is a demo that answers `undefined` three turns in. The
// package's own parser is the check; this asserts it passes and that the
// transcript still says what the demo's project needs it to.

import {describe, expect, it} from 'vitest';

import {
  answerFrom,
  FixtureTransport,
  parseTranscript,
  proposalFrom,
  Role,
} from '@code-dot-org/aitutor';

import demoTranscript from '../demoTranscript.json';

const ask = (text: string) => ({
  message: {
    role: Role.USER,
    status: 'unknown' as const,
    chatMessageText: text,
    timestamp: 0,
    updateId: text,
  },
  history: [],
  session: {},
});

const policy = {
  answerTypes: ['buildHTML', 'buildCSS', 'buildJavaScript', 'buildJSON'],
  fileTypes: ['html', 'css', 'js', 'json'],
};

const play = (text: string) =>
  new FixtureTransport(parseTranscript(demoTranscript), {
    sleep: () => Promise.resolve(),
  }).complete(ask(text));

describe('the demo transcript', () => {
  it('parses', () => {
    expect(() => parseTranscript(demoTranscript)).not.toThrow();
  });

  it('offers a real proposal for a question about colour', () => {
    // The point of having one: the accept/reject flow is otherwise unreachable
    // without a dashboard.
    return play('can you make the heading blue?').then(reply => {
      const answer = answerFrom(reply.structuredOutput);
      expect(answer?.answerType).toBe('buildCSS');
      expect(proposalFrom(answer!, policy)?.files).toEqual([
        {path: 'styles.css', contents: expect.stringContaining('h1')},
      ]);
    });
  });

  it('names a file the demo project actually has', () => {
    // A proposal naming a file that is not there would create one rather than
    // change one, and the demo would look like it had done nothing.
    return play('what colour is the heading?').then(reply => {
      const answer = answerFrom(reply.structuredOutput);
      expect(answer?.code?.[0].filename).toBe('styles.css');
    });
  });

  it('keeps the body rule the demo project starts with', () => {
    // The model is asked for whole files, so a rewrite that dropped the
    // existing rule would silently delete the student's work.
    return play('make the heading blue').then(reply => {
      expect(
        answerFrom(reply.structuredOutput)?.code?.[0].sourceCode,
      ).toContain('font-family: sans-serif');
    });
  });

  it('answers anything else without proposing a change', () => {
    return play('what is a browser?').then(reply => {
      const answer = answerFrom(reply.structuredOutput);
      expect(proposalFrom(answer!, policy)).toBeUndefined();
      expect(answer?.explanation).toBeTruthy();
    });
  });
});

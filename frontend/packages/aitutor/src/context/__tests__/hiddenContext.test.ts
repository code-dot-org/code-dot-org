// The context string, asserted whole.
//
// This is a PROMPT. It has been tuned against a model's behaviour, so a stray
// newline or a reordered section is a change to the input that tuning was done
// against — invisible in a diff of the builder, and not the kind of thing a
// test of "contains the source code" would catch. So the test writes out the
// expected string in full, and it is the same string
// `apps/src/aiTutor/helpers/aiTutorContextHelper.ts` produces for the same
// input.

import {describe, expect, it} from 'vitest';

import {
  codeBlock,
  hiddenContextFrom,
  MAX_CONSOLE_LINES,
} from '../hiddenContext';

describe('hiddenContextFrom', () => {
  it('is empty when the host knows nothing', () => {
    // Not "an empty section for each field" — the legacy filters falsy entries
    // before joining, so nothing in means nothing out.
    expect(hiddenContextFrom({})).toBe('');
  });

  it('is byte-for-byte what the legacy helper produces', () => {
    const context = {
      sourceCode: 'let x = 1;',
      hasRun: false,
      hasEdited: false,
      hiddenSourceCode: 'secret();',
      readOnlySourceCode: 'library();',
      validationContents: 'assert(x)',
      validationResults: '{"passed":false}',
      longInstructions: 'Draw a circle.',
      documentation: '{"circle":"..."}',
      documentationLocation: 'the Help tab',
      examplesLocation: 'the gallery',
      consoleOutput: 'undefined is not a function',
    };

    expect(hiddenContextFrom(context)).toBe(
      [
        "Here is the student's current code: let x = 1;",
        'The student has not run the source code.',
        'The student has not edited the source code.',
        'Here is the hidden source code used to run this lesson. The student cannot view or modify this code so do not reference it in your response: secret();',
        'Here is the source code used to run this lesson. The student can view the code but cannot modify it: library();',
        'Here is the validation code: assert(x)',
        'Here are the validation test names along with their results, in JSON: {"passed":false}',
        'Here are the instructions: Draw a circle.',
        'Here is the documentation: {"circle":"..."}',
        'Here is where the student can find the documentation: the Help tab',
        'Here is where the student can find example projects: the gallery',
        `Here is the output currently shown in the student's debug console, limited to the last ${MAX_CONSOLE_LINES} lines: undefined is not a function`,
      ].join('\n\n'),
    );
  });

  it('keeps the sections in the order the legacy wrote them', () => {
    // The code first, then what the student has done with it, then everything
    // said about it. Reordering is invisible in a diff of the builder and
    // visible to the model.
    const lines = hiddenContextFrom({
      consoleOutput: 'boom',
      longInstructions: 'do the thing',
      sourceCode: 'code',
    }).split('\n\n');

    expect(lines).toEqual([
      "Here is the student's current code: code",
      'Here are the instructions: do the thing',
      "Here is the output currently shown in the student's debug console, limited to the last 50 lines: boom",
    ]);
  });

  it('says nothing about running or editing when the host did not say', () => {
    // `false` is a statement; `undefined` is silence. "The student has not run
    // the code" is worth telling a tutor and "I do not know" is not.
    expect(hiddenContextFrom({sourceCode: 'x'})).toBe(
      "Here is the student's current code: x",
    );
    expect(hiddenContextFrom({sourceCode: 'x', hasRun: true})).toBe(
      "Here is the student's current code: x",
    );
  });

  it('distinguishes tests that have not been run from no tests at all', () => {
    expect(hiddenContextFrom({validationContents: 'assert(x)'})).toBe(
      [
        'The student has not run test validation yet.',
        'Here is the validation code: assert(x)',
      ].join('\n\n'),
    );
    expect(hiddenContextFrom({validationResults: '{}'})).not.toContain(
      'has not run test validation',
    );
  });
});

describe('codeBlock', () => {
  it('fences text', () => {
    expect(codeBlock('x = 1')).toBe('```\nx = 1\n```');
  });

  it('is empty for nothing, rather than an empty fence', () => {
    expect(codeBlock()).toBe('');
    expect(codeBlock('')).toBe('');
  });
});

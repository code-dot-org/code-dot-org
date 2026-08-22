// Whether an answer is something the lab can apply.
//
// The interesting test is the one that says NO for a reason other than the
// answer type: a model that declares a rewrite and hands back a file the lab
// cannot place has done something the student is better served reading than
// accepting.

import {describe, expect, it} from 'vitest';

import {answerFrom, applicableFiles, proposalFrom} from '../proposal';
import type {Answer} from '../schema';

const policy = {
  answerTypes: ['buildHTML', 'buildJavaScript'],
  fileTypes: ['html', 'css', 'js'],
};

const answer = (over: Partial<Answer> = {}): Answer => ({
  answerType: 'buildJavaScript',
  explanation: 'because',
  code: [{filename: 'main.js', sourceCode: 'let x = 1;'}],
  ...over,
});

describe('proposalFrom', () => {
  it('offers a proposal for a declared rewrite the lab can apply', () => {
    expect(proposalFrom(answer(), policy)).toEqual({
      explanation: 'because',
      answerType: 'buildJavaScript',
      files: [{path: 'main.js', contents: 'let x = 1;'}],
    });
  });

  it('is prose for an answer type that is not a rewrite', () => {
    expect(proposalFrom(answer({answerType: 'hint'}), policy)).toBeUndefined();
  });

  it('is prose when the host declared no policy at all', () => {
    // A host that cannot apply files gets a tutor that never offers to.
    expect(proposalFrom(answer(), undefined)).toBeUndefined();
  });

  it('is prose when a file is of a type the lab cannot place', () => {
    // The answer type alone is not enough. `buildJavaScript` with a `.py` file
    // in it would put a Python file in a web project.
    const mixed = answer({
      code: [
        {filename: 'main.js', sourceCode: 'ok'},
        {filename: 'helper.py', sourceCode: 'nope'},
      ],
    });

    expect(proposalFrom(mixed, policy)).toBeUndefined();
  });

  it('is prose for a rewrite that rewrote nothing', () => {
    // The model does this — it explains instead of changing anything — and an
    // Accept button over no files is a button that does nothing.
    expect(proposalFrom(answer({code: []}), policy)).toBeUndefined();
    expect(proposalFrom(answer({code: undefined}), policy)).toBeUndefined();
  });

  it('survives an answer with no explanation', () => {
    expect(
      proposalFrom(answer({explanation: undefined}), policy),
    ).toMatchObject({explanation: ''});
  });
});

describe('applicableFiles', () => {
  it('compares extensions without case', () => {
    expect(applicableFiles([{filename: 'INDEX.HTML'}], ['html'])).toBe(true);
  });

  it('rejects a file with no extension to check', () => {
    expect(applicableFiles([{filename: 'Makefile'}], ['html'])).toBe(false);
  });

  it('rejects a dotfile, which has a name and not an extension', () => {
    expect(applicableFiles([{filename: '.gitignore'}], ['gitignore'])).toBe(
      false,
    );
  });

  it('takes the last extension of a doubled one', () => {
    expect(applicableFiles([{filename: 'page.html.js'}], ['js'])).toBe(true);
  });
});

describe('answerFrom', () => {
  it('unwraps the answer', () => {
    expect(answerFrom({answer: {answerType: 'hint'}})).toEqual({
      answerType: 'hint',
    });
  });

  it('is undefined for anything that is not one', () => {
    // A model that answered in prose despite the schema, or a transport with
    // no structured output at all.
    expect(answerFrom(undefined)).toBeUndefined();
    expect(answerFrom({})).toBeUndefined();
    expect(answerFrom({answer: {}})).toBeUndefined();
    expect(answerFrom('a string')).toBeUndefined();
  });
});

describe('the host’s last word', () => {
  // `answerType` says what the model meant to produce and the extensions say
  // what the lab can place. Neither says whether the content will open — which
  // is the whole question for a lab whose files must parse to be edited at all.

  const withAccepts = (
    accepts: (files: ReadonlyArray<{path: string}>) => boolean,
  ) => ({
    ...policy,
    accepts,
  });

  it('offers nothing the host says it cannot carry out', () => {
    expect(
      proposalFrom(
        answer(),
        withAccepts(() => false),
      ),
    ).toBeUndefined();
  });

  it('offers it when the host agrees', () => {
    expect(
      proposalFrom(
        answer(),
        withAccepts(() => true),
      ),
    ).toBeDefined();
  });

  it('shows the host the files it would apply, not the raw answer', () => {
    // Paths and contents, already unwrapped — the host should not have to know
    // the model's field names to check its own work.
    let seen: ReadonlyArray<{path: string; contents: string}> = [];
    proposalFrom(
      answer(),
      withAccepts(files => {
        seen = files as typeof seen;
        return true;
      }),
    );

    expect(seen).toEqual([{path: 'main.js', contents: 'let x = 1;'}]);
  });

  it('is not asked about an answer that was never a proposal', () => {
    // No point validating files for a hint.
    let asked = false;
    proposalFrom(
      answer({answerType: 'hint'}),
      withAccepts(() => {
        asked = true;
        return true;
      }),
    );

    expect(asked).toBe(false);
  });
});

// Whether an answer is something the lab can apply.
//
// The interesting test is the one that says NO for a reason other than the
// answer type: a model that declares a rewrite and hands back a file the lab
// cannot place has done something the student is better served reading than
// accepting.

import {describe, expect, it} from 'vitest';

import {formatAnswer, formatProposalText} from '../format';
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

const ENCODED_ANSWER =
  '{"answerType": "buildWorld", "goal": "Surround the map with Ground actors so the Player can\'t walk off the edge", "code": [{"filename": "main.world", "sourceCode": "{\\"blocks\\":{\\"blocks\\":[]}}"}], "explanation": "The map is 10x10 tiles (320x320 pixels), with tile centres at 16, 48, 80, ... 304.", "nextSteps": "- Playtest walking to each edge", "questions": "- Same tile for the side walls?"}';

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

// The four ways an answer that CARRIED files ends up as prose. The student sees
// the same thing for all of them — the code fenced in the chat, no Accept
// button — which is correct, and is also exactly what a bug looks like. So each
// one has to say which it was.
describe('saying why an answer was not offered', () => {
  const said = () => {
    const reasons: string[] = [];
    return {reasons, onDowngrade: (why: string) => reasons.push(why)};
  };

  it('names the answer type the lab does not treat as a rewrite', () => {
    const {reasons, onDowngrade} = said();

    proposalFrom(answer({answerType: 'example'}), {...policy, onDowngrade});

    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toContain('example');
    expect(reasons[0]).toContain('buildHTML');
  });

  it('names the files whose kind the lab cannot write', () => {
    const {reasons, onDowngrade} = said();

    proposalFrom(answer({code: [{filename: 'notes.txt', sourceCode: 'hi'}]}), {
      ...policy,
      onDowngrade,
    });

    expect(reasons[0]).toContain('notes.txt');
    expect(reasons[0]).toContain('html, css, js');
  });

  it('says when the host itself refused', () => {
    const {reasons, onDowngrade} = said();

    proposalFrom(answer(), {...policy, accepts: () => false, onDowngrade});

    expect(reasons[0]).toContain('refused');
  });

  it('says when the lab applies nothing at all', () => {
    const {reasons} = said();

    // No policy means no `onDowngrade` to call, so this is the one case the
    // default handles — asserted through the default being reached at all
    // rather than through what it prints.
    expect(proposalFrom(answer(), undefined)).toBeUndefined();
    expect(reasons).toEqual([]);
  });

  it('stays quiet for an ordinary question that brought no files', () => {
    const {reasons, onDowngrade} = said();

    // Not a downgrade. Warning on every turn would bury the one line that
    // matters.
    proposalFrom(answer({answerType: 'ask', code: []}), {
      ...policy,
      onDowngrade,
    });

    expect(reasons).toEqual([]);
  });

  it('does NOT stay quiet for a rewrite that brought no files', () => {
    const {reasons, onDowngrade} = said();

    // The one downgrade a student can see is wrong: a model that pastes the
    // file into its explanation rather than into `code` lands here, and the
    // file is right there in the chat with no button that will apply it.
    proposalFrom(answer({code: []}), {...policy, onDowngrade});

    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toContain('claims a rewrite');
    expect(reasons[0]).toContain('pasted into the explanation');
  });

  it('stays quiet when the offer is made', () => {
    const {reasons, onDowngrade} = said();

    expect(proposalFrom(answer(), {...policy, onDowngrade})).toBeDefined();
    expect(reasons).toEqual([]);
  });
});

// A REAL reply, in the shape it actually arrived in.
//
// Captured from the network tab of a turn the student saw as "There was an
// error getting a response. Please try again." Nothing had gone wrong: the
// model answered completely, declared `buildWorld`, and handed back a whole
// map ringed with Ground. It just spelled the answer object as a JSON STRING,
// one encoding deeper than the schema asks for.
//
// The cost of not tolerating that was total. `answerFrom` returned undefined,
// the message text fell back to the reply's empty text block, and the
// empty-answer guard rewrote the turn as a failure — so the student retried a
// request that had already succeeded.
describe('an answer the model encoded twice', () => {
  const doubled = {answer: ENCODED_ANSWER};

  it('is read, not discarded', () => {
    const found = answerFrom(doubled);

    expect(found?.answerType).toBe('buildWorld');
    expect(found?.code?.[0].filename).toBe('main.world');
  });

  it('still becomes an offer, which is the whole point', () => {
    const found = answerFrom(doubled)!;

    expect(
      proposalFrom(found, {
        answerTypes: ['buildWorld'],
        fileTypes: ['world'],
      }),
    ).toMatchObject({
      answerType: 'buildWorld',
      files: [{path: 'main.world'}],
    });
  });

  it('reads one encoded the whole way down', () => {
    // Belt and braces: a server that re-encodes the wrapper too.
    expect(answerFrom(JSON.stringify(doubled))?.answerType).toBe('buildWorld');
  });

  it('formats to something, which is what stops the failure', () => {
    // The last link in the chain that broke. `answerFrom` returning undefined
    // left the message text as the reply's empty text block, and the
    // empty-answer guard in `useTutor` rewrites an OK turn with no text into
    // an ERROR. Text out of the decoded answer means that guard never fires.
    const found = answerFrom(doubled)!;

    expect(formatAnswer(found).trim()).not.toBe('');
    expect(formatProposalText(found).trim()).not.toBe('');
  });

  it('is undefined for a string that is not an answer at all', () => {
    expect(answerFrom('just some text')).toBeUndefined();
    expect(answerFrom('{"answer":"still not an object"}')).toBeUndefined();
  });
});

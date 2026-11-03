// Deciding whether an answer is something the lab can apply.
//
// The legacy decision, from `useAiTutorResponseSchemaSettings`: an answer whose
// `answerType` is one of the build kinds AND whose files are all of types the
// lab can handle becomes an accept/reject flow; everything else is formatted as
// prose for the student to copy.
//
// Both halves of that test are the HOST'S to state, and neither can be guessed
// here. Which answer types mean "I changed your files" depends on what the lab
// asked the model for; which file types can be applied depends on what a
// project in that lab is made of. What is shared — and worth having one copy of
// — is the test itself, and what happens when it passes.
//
// AN ANSWER TYPE IS NOT ENOUGH ON ITS OWN. `buildJavaScript` with a `.py` file
// in it is a model doing something the lab cannot carry out, and the student is
// better served by prose they can read than by an Accept button that would put
// a Python file in a web project.

import type {Answer} from './schema';

export interface ProposalPolicy {
  /**
   * The `answerType` values that mean the model has rewritten files.
   *
   * `['buildHTML', 'buildCSS', 'buildJavaScript', 'buildJSON']` in weblab2.
   */
  answerTypes: readonly string[];

  /**
   * File extensions this lab can apply, without the dot.
   *
   * `['html', 'css', 'js', 'json']` in weblab2.
   */
  fileTypes: readonly string[];

  /**
   * A last check the host makes before the offer is shown at all.
   *
   * The answer type says what the model MEANT to produce and the extensions say
   * what this lab can place; neither says whether the content is any good. For
   * a lab whose files are plain text that gap does not matter — a broken CSS
   * rule is a broken CSS rule, visibly, and the student can undo it.
   *
   * It matters enormously where a file must PARSE to be opened at all. World
   * Lab's `.actor` is a Blockly workspace: a model that invents a block type
   * writes a file the editor cannot load, and "accept" on that is a student's
   * work replaced by something that will not open. There, this generates the
   * proposed workspace and returns false if it throws — so a bad answer becomes
   * an explanation rather than an offer.
   *
   * Return false and the answer is shown as prose, exactly as an unsupported
   * answer type would be. Omitted, everything applicable is offered.
   */
  accepts?: (files: ReadonlyArray<{path: string; contents: string}>) => boolean;

  /**
   * Told why an answer that CARRIED files was shown as prose anyway.
   *
   * There are four ways for that to happen and the student sees the same thing
   * for all of them: the code printed in the chat, fenced and labelled, with no
   * Accept button. Which is correct behaviour — but it is also what a genuine
   * bug looks like, so without this there is no way to tell "the model chose to
   * explain" from "the model wrote a block type that does not exist".
   *
   * Only for answers that carried files. An ordinary question has nothing to
   * offer and is not a downgrade.
   *
   * Defaults to a `console.warn`. Pass a function to route it elsewhere, or
   * `() => {}` to silence it.
   */
  onDowngrade?: (reason: string) => void;
}

/** A set of file edits the tutor is offering (specs/PLAN.md §8). */
export interface TutorProposal {
  /** Why, in markdown. Shown in the message. */
  explanation: string;
  files: Array<{path: string; contents: string}>;
  /** The declared kind of answer, for the host's own bookkeeping. */
  answerType: string;
}

const extensionOf = (filename: string): string | undefined => {
  const at = filename.lastIndexOf('.');
  // A name with no dot, or one that IS a dot-file, has no extension to check.
  return at > 0 ? filename.slice(at + 1).toLowerCase() : undefined;
};

/** Whether every file is of a type the lab said it could apply. */
export const applicableFiles = (
  files: ReadonlyArray<{filename: string}>,
  fileTypes: readonly string[],
): boolean =>
  files.every(file => {
    const extension = extensionOf(file.filename);
    return extension !== undefined && fileTypes.includes(extension);
  });

const defaultDowngrade = (reason: string): void => {
  console.warn(
    `AI Tutor: showing an answer as prose rather than an offer — ${reason}.`,
  );
};

/**
 * The proposal in an answer, if the host can carry it out.
 *
 * `undefined` means "show it as prose", which is the answer for every kind of
 * turn that is not a rewrite and for every rewrite the lab cannot apply.
 */
export const proposalFrom = (
  answer: Answer,
  policy: ProposalPolicy | undefined,
): TutorProposal | undefined => {
  const code = answer.code ?? [];

  // Every `return undefined` below goes through here, so that an answer which
  // brought files and was not offered always says why somewhere.
  const asProse = (reason: string): undefined => {
    if (code.length) {
      (policy?.onDowngrade ?? defaultDowngrade)(reason);
    }
    return undefined;
  };

  if (!policy) {
    return asProse('this lab does not apply changes');
  }
  if (!policy.answerTypes.includes(answer.answerType)) {
    return asProse(
      `answerType was \`${answer.answerType}\`, and this lab only applies ` +
        `${policy.answerTypes.join(', ')}`,
    );
  }
  // An empty rewrite is not a rewrite. The model says so sometimes — it
  // explains rather than changing anything — and offering Accept over nothing
  // is a button that does nothing.
  //
  // Worth saying out loud even though `asProse` would not, because the answer
  // type CLAIMED a rewrite. A model that pastes a file into its explanation
  // instead of into `code` produces exactly this, and it is the one downgrade
  // the student can see is wrong: the file is right there in the chat and no
  // button will apply it.
  if (code.length === 0) {
    (policy.onDowngrade ?? defaultDowngrade)(
      `answerType was \`${answer.answerType}\`, which claims a rewrite, but no ` +
        'files came with it — a workspace pasted into the explanation cannot ' +
        'be applied',
    );
    return undefined;
  }
  if (!applicableFiles(code, policy.fileTypes)) {
    return asProse(
      `the files are ${code.map(file => file.filename).join(', ')}, and this ` +
        `lab can only write ${policy.fileTypes.join(', ')}`,
    );
  }
  const files = code.map(file => ({
    path: file.filename,
    contents: file.sourceCode,
  }));

  // The host's own last word. Anything it cannot actually carry out is prose,
  // not an offer — an Accept button over a file that will not open is worse
  // than no button at all. The host knows WHY and this does not, so the reason
  // here is deliberately thin: expect a second, more specific line beside it.
  if (policy.accepts && !policy.accepts(files)) {
    return asProse('the lab refused the files it was given');
  }

  return {
    explanation: answer.explanation ?? '',
    answerType: answer.answerType,
    files,
  };
};

/**
 * A value that may have been JSON-encoded one more time than it should be.
 *
 * Providers do this. Asked for an object, a model sometimes emits the object
 * SERIALIZED — a correct answer, spelled as a string — and a server that stores
 * and replays what it was given passes the string straight through. Anything
 * that is not a string is returned as it came.
 */
/**
 * Where the first complete JSON value in `text` ends, if it completes.
 *
 * Written because a model handed back its answer with one brace too many: a
 * whole, valid, correct answer object, and then a stray `}` that the wrapper
 * should have carried. `JSON.parse` reads the value, finds input after it, and
 * throws — so the entire turn was lost to a single character at the end.
 *
 * A scan rather than reading the position out of the thrown message. Engines
 * word that message differently and number it differently (V8 gives a position,
 * SpiderMonkey a line and column), and a parser that only works in Chrome is
 * not a parser.
 *
 * Strings and their escapes are tracked, because a brace inside a string is not
 * a brace — and a serialized Blockly workspace is thousands of characters of
 * exactly that.
 */
export const endOfFirstJsonValue = (text: string): number | undefined => {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let started = false;

  for (let at = 0; at < text.length; at++) {
    const character = text[at];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === '{' || character === '[') {
      depth++;
      started = true;
      continue;
    }
    if (character === '}' || character === ']') {
      depth--;
      if (depth === 0 && started) {
        return at + 1;
      }
      // More closes than opens: not a value with something after it, but
      // something this cannot make sense of at all.
      if (depth < 0) {
        return undefined;
      }
    }
  }
  return undefined;
};

const parsedIfString = (value: unknown, what: string): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    // A complete value with something after it is worth rescuing: the answer is
    // all there and a stray character at the end is not the student's problem.
    // Said out loud even so — a reply needing repair is a fact about the model
    // worth knowing, not a thing to paper over.
    const ends = endOfFirstJsonValue(value);
    if (ends !== undefined && ends < value.length) {
      try {
        const parsed: unknown = JSON.parse(value.slice(0, ends));
        console.warn(
          `AI Tutor: ${what} had ${value.length - ends} character(s) after ` +
            `the end of it (${JSON.stringify(value.slice(ends, ends + 40))}). ` +
            'Read the part that parsed.',
        );
        return parsed;
      } catch {
        // Fall through to the report below: the prefix is no better.
      }
    }
    // SAID OUT LOUD. A silent catch here is how this whole class of bug keeps
    // hiding: the turn ends as "There was an error getting a response" with
    // nothing anywhere to say that a reply arrived and could not be read. The
    // string is printed truncated because it is the whole answer and the
    // interesting part is usually the first line or the last.
    console.warn(
      `AI Tutor: ${what} looked like JSON and did not parse — ` +
        `${error instanceof Error ? error.message : String(error)}. ` +
        `It began: ${value.slice(0, 200)}`,
    );
    return undefined;
  }
};

/**
 * Pull the answer out of the wrapper the schema puts it in.
 *
 * TOLERANT OF DOUBLE ENCODING, at both levels, because the cost of not being
 * was severe and silent: a complete, valid, schema-shaped answer arrived with
 * `answer` as a JSON STRING rather than an object, this returned undefined, the
 * message text fell back to the reply's empty text block, and the empty-answer
 * guard downstream turned the whole turn into "There was an error getting a
 * response. Please try again." The student retried a request that had already
 * succeeded — the answer was sitting in the network tab, whole.
 *
 * Parsing here rather than in a transport because every transport can meet it:
 * it is the model's doing, not the wire's.
 */
export const answerFrom = (structured: unknown): Answer | undefined => {
  const wrapper = parsedIfString(structured, 'the reply') as
    | {answer?: unknown}
    | undefined;
  const answer = parsedIfString(wrapper?.answer, 'the answer') as
    | Answer
    | undefined;
  if (answer?.answerType) {
    return answer;
  }
  // A reply came and no answer could be read out of it. Downstream this becomes
  // an empty message, which the turn then reports as a failure — so without
  // this line the student is told the request failed when it succeeded, and
  // nothing says otherwise. `structured` being absent is ordinary: a transport
  // that was never asked for structured output has nothing here.
  if (structured !== undefined && structured !== null) {
    console.warn(
      'AI Tutor: a reply arrived with no answer in it. Keys: ' +
        `${Object.keys((wrapper ?? {}) as object).join(', ') || '(none)'}; ` +
        `answerType: ${String((answer as {answerType?: unknown})?.answerType)}.`,
    );
  }
  return undefined;
};

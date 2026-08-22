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
  if (!policy || !policy.answerTypes.includes(answer.answerType)) {
    return undefined;
  }
  const code = answer.code ?? [];
  // An empty rewrite is not a rewrite. The model says so sometimes — it
  // explains rather than changing anything — and offering Accept over nothing
  // is a button that does nothing.
  if (code.length === 0 || !applicableFiles(code, policy.fileTypes)) {
    return undefined;
  }
  const files = code.map(file => ({
    path: file.filename,
    contents: file.sourceCode,
  }));

  // The host's own last word. Anything it cannot actually carry out is prose,
  // not an offer — an Accept button over a file that will not open is worse
  // than no button at all.
  if (policy.accepts && !policy.accepts(files)) {
    return undefined;
  }

  return {
    explanation: answer.explanation ?? '',
    answerType: answer.answerType,
    files,
  };
};

/** Pull the answer out of the wrapper the schema puts it in. */
export const answerFrom = (structured: unknown): Answer | undefined => {
  const wrapper = structured as {answer?: Answer} | undefined;
  return wrapper?.answer?.answerType ? wrapper.answer : undefined;
};

// Taking the agent's proposed workspaces, and refusing the ones that would not
// open.
//
// This is the part that makes an editing agent safe here. Web Lab's files are
// text: a wrong stylesheet is visibly wrong and the student can undo it. A
// `.actor` is a Blockly workspace, and a workspace that names a block type
// which does not exist is a file the editor CANNOT LOAD. Accepting one would
// replace a student's work with something that will not open.
//
// So every proposed file is generated before it is offered. The generator
// parses the JSON, loads the workspace, and emits the module — throwing on
// malformed JSON, on an unknown block type, and on a root the file's kind does
// not allow. If it throws, the answer is shown as prose instead
// (`ProposalPolicy.accepts`), which costs the student an explanation rather
// than their project.
//
// The check is the REAL one, not a schema: it is the same call the compiler
// makes, so a workspace that passes here is a workspace that opens.

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {refreshProjectDropdowns} from '../blockly/projectDropdowns';
import {importStockRule} from '../rules/importStockRule';
import type {StockRule} from '../rules/stock';
import {
  projectFiles,
  projectImagePaths,
  projectSoundPaths,
} from '../runtime/projectFiles';

import {impliedRules} from './impliedRules';

/** Kinds the agent may write. Everything else is data or an image. */
export const PROPOSABLE_TYPES = ['actor', 'world', 'rule'] as const;

const extensionOf = (path: string): string =>
  path.split('.').pop()?.toLowerCase() ?? '';

/** A rule file, by the only thing that decides a file's kind: its name. */
const isRule = (path: string): boolean => extensionOf(path) === 'rule';

/** A proposed file's name, without any folders the model invented. */
const nameOf = (path: string): string => path.split('/').pop() ?? path;

export interface ProposedFile {
  path: string;
  contents: string;
}

/** The project as it would be if the offer were accepted. */
export interface ProposedProject {
  source: MultiFileSource;
  /** Stock rules brought in because a proposed file elects their traits. */
  imported: StockRule[];
}

/**
 * Apply an offer to a copy of the project: the rules it implies, then the
 * workspaces themselves.
 *
 * ONE FUNCTION FOR BOTH HALVES. The check and the application used to be
 * different code — generate each file, then separately merge them — and the
 * moment a proposal could also bring a RULE with it, those two could disagree
 * about what was being judged. Validation now means "generate the project this
 * would produce", so a passing check is a statement about the thing that will
 * actually be written.
 */
export const proposedProject = (
  source: MultiFileSource,
  files: readonly ProposedFile[],
): ProposedProject => {
  const imported = impliedRules(
    source,
    files.map(file => file.contents),
  );
  let current = source;
  for (const rule of imported) {
    current = importStockRule(current, rule).source;
  }
  return {source: mergeProposedWorkspaces(current, files).source, imported};
};

/** Why a proposed file was refused — one line, for the console. */
export interface Refusal {
  path: string;
  reason: string;
}

/**
 * How a whole project is generated — `generatedProject` from the runtime.
 *
 * The WHOLE project, not one file: a single proposed actor cannot be judged
 * alone once a proposal may also bring a rule, because whether it generates
 * depends on a rule that is not in the project yet. `generateFile` compiles
 * against the project as it stands and would refuse every such offer.
 */
export type GenerateAll = (
  files: Record<string, string>,
) => Record<string, string>;

/**
 * Why an offer was refused, if it was.
 *
 * The project it would produce is generated whole. That is one pass, and on
 * failure each proposed file is then tried on its own — against the same
 * augmented project, so the retry is judging what the first pass judged — to
 * say WHICH file is the problem. Attribution costs a pass only when something
 * is already wrong.
 */
export const refusedWorkspaces = (
  source: MultiFileSource,
  files: readonly ProposedFile[],
  generateAll: GenerateAll,
): Refusal[] => {
  const wrongKind = files
    .filter(file => !PROPOSABLE_TYPES.includes(extensionOf(file.path) as never))
    .map(file => ({
      path: file.path,
      reason: `not a kind the agent may write (${PROPOSABLE_TYPES.join(', ')})`,
    }));
  if (wrongKind.length) {
    return wrongKind;
  }

  // TELL THE EDITOR'S REGISTRIES, not just the file map.
  //
  // A trait is not a block type. `use trait` is one block whose TRAIT field is
  // a dropdown, and its options are the traits in play — held in registries
  // that `refreshProjectDropdowns` fills from the project's files. Handing the
  // generator a file map containing `bounds.rule` does not put Boundaries in
  // them, so `Boundaries#StaysAcrossTrait` remains a value with no option
  // behind it and the file will not load. The offer that brings the rule with
  // it was refused for not already having it.
  //
  // This is the call `compileProject` makes before generating, which is why the
  // test harness accepted the offer and the running lab did not: the harness
  // was doing something the real gate was not.
  const describeProject = (
    of: MultiFileSource,
    files: Record<string, string>,
  ) =>
    refreshProjectDropdowns(
      files,
      projectImagePaths(of),
      {},
      projectSoundPaths(of),
    );

  const held = projectFiles(source);

  const generates = (offered: readonly ProposedFile[]): string | undefined => {
    const candidate = proposedProject(source, offered).source;
    const files = projectFiles(candidate);

    // WHAT IS CHECKED IS WHAT THE MODEL WROTE, and not the rules that came with
    // it. An imported `.rule` is ours: generated from `scripts/rules/*.mjs`,
    // committed, and covered by its own tests. Generating it here proves
    // nothing about the offer.
    //
    // It also cannot be done. The generator's block palette is built from the
    // project's rules AS THEY WERE — a memo over a prop, which nothing outside
    // the component can rebuild — so a rule that has just arrived has no block
    // definitions, and loading it fails on the first one of its own blocks it
    // meets ("Invalid block definition for type
    // world_query_Boundaries_KeepBetweenAndQuery"). The registries below still
    // get the whole project, because the ACTOR needs `Boundaries#StaysAcross`
    // to be a trait that exists; it is only the rule's own file that is skipped.
    const toGenerate = Object.fromEntries(
      Object.entries(files).filter(([path]) => path in held || !isRule(path)),
    );

    try {
      describeProject(candidate, files);
      generateAll(toGenerate);
      return undefined;
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    } finally {
      // Always put it back. These registries are what the editor's own
      // dropdowns read, and leaving them describing a project the student has
      // not agreed to would offer blocks from a rule they do not have.
      //
      // Image SIZES are not restored — they are measured asynchronously and
      // this has none to give. That costs a re-measure, not correctness.
      describeProject(source, projectFiles(source));
    }
  };

  const whole = generates(files);
  if (whole === undefined) {
    return [];
  }
  const each = files
    .map(file => ({path: file.path, reason: generates([file])}))
    .filter((one): one is Refusal => one.reason !== undefined);

  // Every file on its own is fine and together they are not: report the
  // failure rather than an empty list, which would read as "nothing wrong".
  return each.length
    ? each
    : [{path: files.map(f => f.path).join(', '), reason: whole}];
};

/**
 * Whether an offer can be carried out, saying so when it cannot.
 *
 * The warning goes to the browser console rather than to the student: a
 * refusal is not their mistake and there is nothing for them to do about it.
 * What they get is the explanation, which is what the downgrade is for.
 */
export const workspacesGenerate = (
  source: MultiFileSource,
  files: readonly ProposedFile[],
  generateAll: GenerateAll,
): boolean => {
  const refused = refusedWorkspaces(source, files, generateAll);
  if (refused.length) {
    console.warn(
      'AI Tutor: refusing to offer a change, because it would not open:\n' +
        refused.map(one => `  ${one.path}: ${one.reason}`).join('\n'),
    );
  }
  return refused.length === 0;
};

export interface MergeResult {
  source: MultiFileSource;
  changed: ProjectFile[];
}

/**
 * A copy of `source` with the proposed workspaces written into it.
 *
 * Matched by NAME rather than full path, because a world project's folders are
 * a convention (`actors/`, `rules/`) rather than part of a file's identity, and
 * the model is asked for the files it changed rather than for a layout. A file
 * the project does not have is created beside its kind's siblings, which is how
 * a new rule lands in `rules/` without the model being told to put it there.
 */
export const mergeProposedWorkspaces = (
  source: MultiFileSource,
  proposed: readonly ProposedFile[],
): MergeResult => {
  const files = {...source.files};
  const changed: ProjectFile[] = [];

  const nextId = () =>
    String(
      Math.max(0, ...Object.keys(files).map(Number).filter(Number.isInteger)) +
        1,
    );

  for (const file of proposed) {
    const name = nameOf(file.path);
    const existing = Object.values(files).find(held => held.name === name);
    const extension = extensionOf(name);

    // A new file joins its own kind: the folder its siblings are in, or the
    // root if it is the first of its kind.
    const sibling = Object.values(files).find(
      held => extensionOf(held.name) === extension,
    );

    const updated: ProjectFile = existing
      ? {...existing, contents: file.contents}
      : {
          id: nextId(),
          name,
          language: 'json',
          contents: file.contents,
          folderId: sibling?.folderId ?? '0',
          open: true,
        };

    files[updated.id] = updated;
    changed.push(updated);
  }

  return {source: {...source, files}, changed};
};

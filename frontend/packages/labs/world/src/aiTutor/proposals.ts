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

/** Kinds the agent may write. Everything else is data or an image. */
export const PROPOSABLE_TYPES = ['actor', 'world', 'rule'] as const;

const extensionOf = (path: string): string =>
  path.split('.').pop()?.toLowerCase() ?? '';

/** A proposed file's name, without any folders the model invented. */
const nameOf = (path: string): string => path.split('/').pop() ?? path;

export interface ProposedFile {
  path: string;
  contents: string;
}

/**
 * Whether every proposed workspace generates.
 *
 * `generate` is the headless generator (`WorldRuntimeContext`); it throws for
 * anything the editor could not open. Each file is tried on its own, because
 * one bad file should disqualify the whole offer — a half-applied proposal is
 * a project in a state nobody asked for.
 */
export const workspacesGenerate = (
  files: readonly ProposedFile[],
  generate: (contents: string, path: string) => string,
): boolean =>
  files.every(file => {
    if (!PROPOSABLE_TYPES.includes(extensionOf(file.path) as never)) {
      return false;
    }
    try {
      // The return value is not inspected: an empty module is a legitimate
      // answer (an actor with no handlers yet). What matters is that it did
      // not throw.
      generate(file.contents, file.path);
      return true;
    } catch {
      return false;
    }
  });

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

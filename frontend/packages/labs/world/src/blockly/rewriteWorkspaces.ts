// Rewriting the project's saved workspaces.
//
// The mechanism behind every rename that carries (renameRule, renameAnimation):
// a walk over a workspace's JSON that hands each block's type and fields to a
// caller who knows what a reference looks like. Structural rather than textual,
// because a name occurs in plenty of places a rename must not touch — a `log`
// block's message, an actor with the same name, a comment about it — and in
// exactly the places the caller names it must.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {isActorData, keyRows, withKeyRows} from '../actors/actorData';
import {
  isRuleData,
  ruleKeyRows,
  ruleViewOf,
  withRuleKeyRows,
} from '../rules/ruleData';
import {resolveRuleContents} from '../rules/ruleReference';

/** A hat's subject field (`eventSubject.SUBJECT_FIELD`), named here so this
 *  walk stays free of Blockly. */
const SUBJECT_FIELD = 'SUBJECT';

/**
 * File kinds that hold Blockly workspaces, and so can hold a reference. A map
 * and a screen are documents, but their own code and each placement's are
 * workspaces inside them, and the walk below finds them there.
 */
export const WORKSPACE_FILE = /\.(rule|actor|world|map|screen)$/;

/** How a saved workspace is rewritten: block types, and reference fields. */
export interface Rewriter {
  /** The type this block should have — the same string when it is untouched. */
  type?(type: string): string;
  /** Rewrite reference values in place. `blockType` is the block they are on. */
  fields(fields: Record<string, unknown>, blockType: string | undefined): void;
}

/**
 * Apply a rewriter to a saved workspace, or undefined if it changed nothing (or
 * the file is not JSON — one mid-edit is left exactly as it is).
 */
export function rewriteWorkspace(
  contents: string,
  rewriter: Rewriter,
): string | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return undefined;
  }
  const before = JSON.stringify(parsed);

  // Walk everything rather than the block tree specifically: a block can hang
  // off `next`, an input, a shadow, or a mutator's `extraState`, and a walk that
  // knows the shape is a walk that misses the next shape somebody adds.
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    const node = value as Record<string, unknown>;
    const blockType = typeof node.type === 'string' ? node.type : undefined;
    if (blockType !== undefined && rewriter.type) {
      node.type = rewriter.type(blockType);
    }
    if (node.fields && typeof node.fields === 'object') {
      const fields = node.fields as Record<string, unknown>;
      // A hat about a PROPERTY names it by its getter's block type, which is
      // renamed with the property (specs/PROPERTY_SUBJECTS_PLAN.md).
      if (
        rewriter.type &&
        typeof fields[SUBJECT_FIELD] === 'string' &&
        (fields[SUBJECT_FIELD] as string).startsWith('world_get_')
      ) {
        fields[SUBJECT_FIELD] = rewriter.type(fields[SUBJECT_FIELD] as string);
      }
      rewriter.fields(fields, blockType);
    }
    for (const child of Object.values(node)) {
      walk(child);
    }
  };
  // An actor's own keys name things too, and are walked as the blocks they
  // stand for (`actorData.keyRows`), and so do a rule's, whose bodies are
  // among them (`ruleData.ruleKeyRows`).
  if (isActorData(parsed)) {
    const rows = keyRows(parsed);
    walk(parsed.blocks);
    walk(rows);
    parsed = withKeyRows(parsed, rows);
  } else if (isRuleData(parsed)) {
    const rows = ruleKeyRows(parsed);
    walk(rows);
    parsed = withRuleKeyRows(parsed, rows);
  } else {
    walk(parsed);
  }

  return JSON.stringify(parsed) === before
    ? undefined
    : JSON.stringify(parsed, null, 2);
}

/**
 * A workspace file's contents as a walk reads them: a reference as the rule
 * it names, and a rule's data as its view.
 */
export const workspaceViewOf = (contents: string): string =>
  ruleViewOf(resolveRuleContents(contents));

/**
 * Apply a per-file rewrite to every saved workspace in the project.
 *
 * Returns the same source object when nothing changed, so a caller can skip the
 * write.
 *
 * AND THIS IS WHERE A REFERENCE BECOMES A COPY. A rule the learner has not
 * edited is stored as a reference to the library's (rules/ruleReference), and
 * a reference holds none of the names a rewrite is looking for — so it is
 * resolved on the way in. What comes back out is the rewritten rule, written
 * where the reference was.
 *
 * Which is right, and is the whole of copy-on-edit: a rewrite that changes
 * something is an EDIT — the learner renamed this rule, or renamed one it
 * refers to, and either way this file no longer says what the library's does.
 * A rewrite that changes nothing returns undefined, the file is not touched,
 * and the reference stays a reference. Nothing else has to decide when to
 * promote one.
 */
export function mapWorkspaces(
  source: MultiFileSource,
  rewrite: (contents: string) => string | undefined,
): MultiFileSource {
  const files = {...source.files};
  let changed = false;
  for (const [id, file] of Object.entries(source.files)) {
    if (!WORKSPACE_FILE.test(file.name)) {
      continue;
    }
    const renamed = rewrite(resolveRuleContents(file.contents));
    if (renamed !== undefined) {
      files[id] = {...file, contents: renamed};
      changed = true;
    }
  }
  return changed ? {...source, files} : source;
}

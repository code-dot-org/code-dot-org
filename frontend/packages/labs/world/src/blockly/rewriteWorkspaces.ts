// Rewriting the project's saved workspaces.
//
// The mechanism behind every rename that carries (renameRule, renameAnimation):
// a walk over a workspace's JSON that hands each block's type and fields to a
// caller who knows what a reference looks like. Structural rather than textual,
// because a name occurs in plenty of places a rename must not touch — a `log`
// block's message, an actor with the same name, a comment about it — and in
// exactly the places the caller names it must.

import type {MultiFileSource} from '@code-dot-org/core/api';

/** File kinds that are Blockly workspaces, and so can hold a reference. */
export const WORKSPACE_FILE = /\.(rule|actor|world)$/;

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
      rewriter.fields(node.fields as Record<string, unknown>, blockType);
    }
    for (const child of Object.values(node)) {
      walk(child);
    }
  };
  walk(parsed);

  return JSON.stringify(parsed) === before
    ? undefined
    : JSON.stringify(parsed, null, 2);
}

/**
 * Apply a per-file rewrite to every saved workspace in the project.
 *
 * Returns the same source object when nothing changed, so a caller can skip the
 * write.
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
    const renamed = rewrite(file.contents);
    if (renamed !== undefined) {
      files[id] = {...file, contents: renamed};
      changed = true;
    }
  }
  return changed ? {...source, files} : source;
}

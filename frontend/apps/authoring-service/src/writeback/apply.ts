// Executes a write-back plan: recomputes it (so apply and plan can never
// diverge — see plan.ts's doc comment), then writes each edit's patched
// content to disk, one file at a time, with its own collision guard.
//
// Three refusal shapes, each independent per edit except the first:
//
// - plan-changed (whole apply refused): the caller's `expectedPlanHash`
//   doesn't match what recomputing the plan produces right now. The caller
//   never applies a diff it didn't just see — see POST /api/writeback/apply
//   (server.ts) for why this is a 409, not a per-edit skip.
// - path escapes the allowed root: refused unconditionally. A level name is
//   author-editable input (creatable levels, a later pass), so `../` in a
//   resolved path is a real traversal vector, not a theoretical one.
// - changed-on-disk: the file's current bytes no longer hash to what the
//   plan captured as `beforeHash` — something else wrote it between plan and
//   apply. That edit is skipped; every other edit in the same apply still
//   goes through.

import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildWritebackPlan,
  CREATABLE_LEVEL_DIRECTORY,
  type WritebackPlan,
  type WritebackPlanInput,
  type WritebackSkip,
} from './plan.js';

export interface WritebackApplyInput extends WritebackPlanInput {
  /**
   * Directory every write must resolve inside. Defaults to
   * `<repoRoot>/dashboard/config/levels` (repoRoot is required either way —
   * buildWritebackPlan already needs it to resolve level file paths).
   */
  allowedRoot?: string;
  /** Defaults to a real temp-file-then-rename write; overridden in tests. */
  writeFileAtomic?: (filePath: string, contents: string) => void;
}

export interface WritebackApplyResult {
  applied: {path: string; afterHash: string}[];
  skipped: WritebackSkip[];
}

export type WritebackApplyOutcome =
  | {ok: true; planHash: string; result: WritebackApplyResult}
  | {ok: false; reason: 'plan-changed'; planHash: string; plan: WritebackPlan};

/**
 * A hash of the plan's substance (not the diff text, which is derived and
 * would just make the same substance harder to compare) — what the
 * plan-changed check compares the caller's `expectedPlanHash` against.
 */
export function computePlanHash(plan: Pick<WritebackPlan, 'edits' | 'skipped'>): string {
  const canonical = JSON.stringify({
    edits: plan.edits.map(edit =>
      edit.kind === 'create'
        ? {kind: 'create', path: edit.path, levelKey: edit.levelKey, name: edit.name, afterHash: edit.afterHash}
        : {kind: 'edit', path: edit.path, levelKey: edit.levelKey, beforeHash: edit.beforeHash, afterHash: edit.afterHash},
    ),
    skipped: plan.skipped,
  });
  return sha256(canonical);
}

export function applyWritebackPlan(
  input: WritebackApplyInput,
  expectedPlanHash?: string,
): WritebackApplyOutcome {
  const plan = buildWritebackPlan(input);
  const planHash = computePlanHash(plan);
  if (expectedPlanHash !== undefined && expectedPlanHash !== planHash) {
    return {ok: false, reason: 'plan-changed', planHash, plan};
  }

  const repoRoot = input.repoRoot;
  const allowedRoot = path.resolve(
    input.allowedRoot ?? path.join(repoRoot ?? '', 'dashboard', 'config', 'levels'),
  );
  const writeFileAtomic = input.writeFileAtomic ?? defaultWriteFileAtomic;

  const applied: WritebackApplyResult['applied'] = [];
  const skipped: WritebackSkip[] = [...plan.skipped];

  for (const edit of plan.edits) {
    if (edit.kind === 'create') {
      // A create's identity is `name`, not a catalog-resolved levelKey (a
      // draft: key was never in the catalog to begin with) — the target
      // path is recomputed the same deterministic way plan.ts derived it,
      // never trusted from a stored field on the plan object across this
      // rebuild (same discipline as an edit's own resolveLevelFilePath
      // re-resolution just below).
      const absolutePath = path.resolve(
        path.join(repoRoot ?? '', ...CREATABLE_LEVEL_DIRECTORY, `${edit.name}.level`),
      );
      if (!isWithin(allowedRoot, absolutePath)) {
        skipped.push({
          experienceId: edit.experienceId,
          field: edit.path,
          reason: `refused: ${absolutePath} is outside the allowed root ${allowedRoot}`,
        });
        continue;
      }
      let alreadyExists = true;
      try {
        input.readFile(absolutePath);
      } catch {
        alreadyExists = false;
      }
      if (alreadyExists) {
        skipped.push({
          experienceId: edit.experienceId,
          field: edit.path,
          reason: `refused: ${absolutePath} already exists — a name collision since the plan was computed; re-open the write-back dialog and pick a different name`,
        });
        continue;
      }
      try {
        writeFileAtomic(absolutePath, edit.after);
      } catch (error) {
        skipped.push({
          experienceId: edit.experienceId,
          reason: `could not write ${absolutePath}: ${String(error)}`,
        });
        continue;
      }
      applied.push({path: edit.path, afterHash: edit.afterHash});
      continue;
    }

    const resolvedPath = input.resolveLevelFilePath(edit.levelKey);
    if (!resolvedPath) {
      skipped.push({
        experienceId: edit.levelKey,
        reason: `no file resolved for level key "${edit.levelKey}" at apply time (resolved fine during planning)`,
      });
      continue;
    }
    const absolutePath = path.resolve(resolvedPath);
    if (!isWithin(allowedRoot, absolutePath)) {
      skipped.push({
        experienceId: edit.levelKey,
        field: edit.path,
        reason: `refused: ${absolutePath} is outside the allowed root ${allowedRoot}`,
      });
      continue;
    }

    let current: string;
    try {
      current = input.readFile(absolutePath);
    } catch (error) {
      skipped.push({
        experienceId: edit.levelKey,
        reason: `could not re-read ${absolutePath} at apply time: ${String(error)}`,
      });
      continue;
    }
    if (sha256(current) !== edit.beforeHash) {
      skipped.push({
        experienceId: edit.levelKey,
        field: edit.path,
        reason: `changed-on-disk: ${absolutePath} was modified since the plan was computed; re-open the write-back dialog to recompute`,
      });
      continue;
    }

    try {
      writeFileAtomic(absolutePath, edit.after);
    } catch (error) {
      skipped.push({
        experienceId: edit.levelKey,
        reason: `could not write ${absolutePath}: ${String(error)}`,
      });
      continue;
    }
    applied.push({path: edit.path, afterHash: edit.afterHash});
  }

  return {ok: true, planHash, result: {applied, skipped}};
}

/** True when `target` resolves strictly inside `root` (not equal to it). */
function isWithin(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  return rel !== '' && !rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel);
}

// Same temp-file-then-rename convention as SessionStore.writeSnapshot: a
// crash mid-write leaves the temp file orphaned, never a half-written
// .level file in place.
function defaultWriteFileAtomic(filePath: string, contents: string): void {
  const temp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, contents, 'utf8');
  fs.renameSync(temp, filePath);
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

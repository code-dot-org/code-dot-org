// The way back to the Main Screen: the steps from the entry file to what is
// open, which the breadcrumb draws (specs/SHELL_PLAN.md, step 1).
//
// The trail follows the active file rather than being told where the learner
// went. Every way of opening a file already ends in `activateFile` — the
// file acts' `open`, a block naming a module, the map editor's Open, Show me — so
// watching that one fact keeps the trail right without any of them knowing it
// exists.

/**
 * A placed actor's code, or the Screen's or Map's own, open in its file; or
 * an actor's code, open from the Actor Editor (`code`).
 */
export type ScriptStep =
  | {kind: 'placement'; id: string}
  | {kind: 'map'}
  | {kind: 'code'};

/** One step: a file, or a script open within it. */
export interface TrailStep {
  fileId: string;
  script?: ScriptStep;
}

export type Trail = readonly TrailStep[];

const sameScript = (a?: ScriptStep, b?: ScriptStep): boolean =>
  a?.kind === b?.kind &&
  (a?.kind !== 'placement' || a.id === (b as typeof a).id);

/**
 * The trail once `activeId` is the file in front.
 *
 * The entry is always the first step. A file already on the trail cuts it
 * back to that file's own step; any other file is a new step after the last.
 * Steps whose files are gone (`exists`) are dropped first, so a deleted map
 * does not stay on the way back. The same trail is returned when nothing
 * changed, so a caller holding it in state does not render again.
 */
export function follow(
  trail: Trail,
  activeId: string | undefined,
  entryId: string | undefined,
  exists: (fileId: string) => boolean = () => true,
): Trail {
  let next: TrailStep[] = trail.filter(step => exists(step.fileId));
  if (entryId && next[0]?.fileId !== entryId) {
    next = [{fileId: entryId}];
  }
  const last = next[next.length - 1];
  if (activeId && last?.fileId !== activeId) {
    const at = next.findIndex(step => step.fileId === activeId && !step.script);
    next = at >= 0 ? next.slice(0, at + 1) : [...next, {fileId: activeId}];
  }
  const unchanged =
    next.length === trail.length &&
    next.every(
      (step, at) =>
        step.fileId === trail[at].fileId &&
        sameScript(step.script, trail[at].script),
    );
  return unchanged ? trail : next;
}

/**
 * The script open in `fileId`, when it is the last step: a script is only
 * open while it is what the learner is looking at.
 */
export function scriptOf(trail: Trail, fileId: string): ScriptStep | null {
  const last = trail[trail.length - 1];
  return last?.fileId === fileId && last.script ? last.script : null;
}

/**
 * The trail with `script` open in `fileId`, or closed when it is null. A
 * script replaces any other open in the same file: they are not nested.
 */
export function withScript(
  trail: Trail,
  fileId: string,
  script: ScriptStep | null,
): Trail {
  const at = trail.findIndex(step => step.fileId === fileId && !step.script);
  if (at < 0) {
    return trail;
  }
  const kept = trail.slice(0, at + 1);
  return script ? [...kept, {fileId, script}] : kept;
}

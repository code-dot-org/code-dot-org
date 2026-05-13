/**
 * Tiny, module-level publish/subscribe for "what's the student currently
 * working on?" — the AI Tutor's hidden-context callback reads from here on
 * every send. Each lab stage (Music, Maze, Datasci, AiTrainer) publishes
 * its current Blockly code; the tutor host reads.
 *
 * Module-scoped mutable state is intentionally cheap here. The labs in the
 * guided lesson are mounted one-at-a-time inside `<LessonStage>`, so there's
 * never more than one active context. When a lab unmounts it clears.
 */

import type {AiTutorContext} from '@code-dot-org/ai-tutor';

export interface LabContextSnapshot {
  /** URL slug of the lab: 'music' | 'maze' | 'datasci' | 'ai-trainer'. */
  labType: string;
  /** Step-level instructions the student is working through. */
  longInstructions?: string;
  /** Current student source (typically Blockly-generated code). */
  sourceCode?: string;
  /** Has the student pressed Run since the lab mounted? */
  hasRun?: boolean;
  /** Has the student edited the workspace since it mounted? */
  hasEdited?: boolean;
}

let current: LabContextSnapshot | null = null;
const subscribers = new Set<() => void>();

/** Publish (or update) the active lab's context. */
export function setLabContext(snapshot: LabContextSnapshot): void {
  current = snapshot;
  subscribers.forEach(fn => fn());
}

/** Clear the active context (call on lab unmount). */
export function clearLabContext(): void {
  current = null;
  subscribers.forEach(fn => fn());
}

/** Read the active context. Returns null if no lab is mounted. */
export function getLabContext(): LabContextSnapshot | null {
  return current;
}

/** Subscribe to context changes. Returns an unsubscribe fn. */
export function subscribeLabContext(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/**
 * Map the lab-registry snapshot into the shape the legacy
 * `buildHiddenContextString` expects. The AI Tutor receives a structured
 * context string built from this — same format as the legacy AI Tutor.
 */
export function toAiTutorContext(
  snapshot: LabContextSnapshot | null,
): AiTutorContext {
  if (!snapshot) return {};
  return {
    sourceCode: snapshot.sourceCode,
    longInstructions: snapshot.longInstructions,
    hasRun: snapshot.hasRun,
    hasEdited: snapshot.hasEdited,
  };
}

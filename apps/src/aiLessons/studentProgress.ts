// Persistence + LLM-summary for a student's progress through an AI
// Lesson.  Progress is keyed (server-side) by the lesson ID and the
// signed-in user ID, and stored as a JSON blob under
// `dashboard/tmp/ai_lessons/progress/<lessonId>/<userId>.json`.
//
// Every time the student runs their code or completes a checkpoint, we:
//   1. Append an event to the timeline
//   2. Bump `lastCompletedCheckpointIndex` (only on completion)
//   3. Ask the AI Gateway for a 2-3 sentence plain-English summary of
//      what they've been doing, written for their teacher
//   4. PUT the new snapshot to the server
//
// We don't try to be clever about debouncing.  Hackathon scope: every
// run/completion fires the chain.  If the LLM call fails, we still
// save the structural state and skip the summary update for that turn.

import {Output} from 'ai';
import z from 'zod/v3';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {initAiLessonsGatewayContext} from './aiGatewaySetup';
import {loggedGenerateText} from './aiLog';
import {AdaptivityMode, LessonPlan, pathStepsFor} from './types';

const MODEL_ID = AiChatModelIds.GEMINI_2_5_FLASH;
const MAX_EVENTS_TO_KEEP = 200;

export type ProgressEventType = 'run' | 'checkpoint-completed';

export interface ProgressEvent {
  type: ProgressEventType;
  checkpointIndex: number;
  checkpointId: string;
  checkpointTitle: string;
  at: string;
  // Optional snapshot of the student's work at the moment of the event.
  // Bounded to a reasonable length to keep payloads small.
  workExcerpt?: string;
  // Set when this completion navigated via a branch option the student
  // chose, so the future adaptive resolver can see which paths were taken.
  branchOptionId?: string;
}

export interface ProgressSnapshot {
  lastCompletedCheckpointIndex: number;
  lastCompletedCheckpointId?: string;
  totalCheckpoints: number;
  summary: string;
  events: ProgressEvent[];
  updatedAt: string;
  // Step ids visited in order, ending with `currentStepId`.  Snapshots
  // written before branching landed lack these; resume falls back to
  // lastCompletedCheckpointIndex + 1.
  path?: string[];
  currentStepId?: string;
  // Every step id the student has completed, in completion order.
  // Unlike `path` (which records navigation, revisits included), this
  // is the set skill-tree hubs count: a path's ring segments light per
  // completed step.
  completedStepIds?: string[];
  // Set once the student reaches the end of the lesson.  The durable
  // "lesson finished" marker — step counts can't stand in for it because
  // generated steps change the denominator.
  completed?: boolean;
  // The adaptivity mode this run started in.  Resuming without an
  // explicit ?adaptivity= override restores it, so a full-mode run
  // doesn't silently degrade to the authored default.
  adaptivityMode?: AdaptivityMode;
  // Latest tutor verdict per lesson-checklist item id.
  checklist?: {[itemId: string]: boolean};
  // Rubric-scored observations of HOW the student worked, keyed by the
  // step that carries the rubric.  Teacher-facing; also fed to the
  // tutor's context.
  observations?: {[stepId: string]: StepObservation};
  // Mastery verdicts per skill path, judged against the path's
  // objective/standard when its last step completes.  Teacher-facing;
  // later also the trigger for agent-generated remediation steps.
  mastery?: {[pathId: string]: PathMastery};
}

export interface PathMastery {
  mastered: boolean;
  // The judge's evidence-citing rationale, teacher-facing.
  reasoning: string;
  // What's missing when not mastered; feeds the future remediation
  // generator.
  gaps?: string[];
  at: string;
}

export interface StepObservation {
  // 2-3 teacher-facing sentences about how the student approached the
  // step (not what the code contains).
  summary: string;
  // 0 (flailing) to 4 (highly effective), per the step's rubric.
  score?: number;
  at: string;
}

const EMPTY_SUMMARY = 'No progress yet.';

const summarySchema = Output.object({
  schema: z.object({
    summary: z
      .string()
      .describe(
        '2-3 plain-English sentences for the teacher, summarising what the student has been doing in the lesson so far. Reference checkpoint titles and what they actually completed. No emoji, no markdown, no second-person ("you"); third-person ("the student" or the student name if obvious).'
      ),
  }),
});

function progressUrl(lessonId: string): string {
  return `/ai_lessons/${encodeURIComponent(lessonId)}/progress`;
}

export async function loadProgress(
  lessonId: string
): Promise<ProgressSnapshot | undefined> {
  try {
    const response = await HttpClient.get(progressUrl(lessonId));
    return (await response.json()) as ProgressSnapshot;
  } catch {
    return undefined;
  }
}

async function putProgress(
  lessonId: string,
  snapshot: ProgressSnapshot
): Promise<void> {
  await HttpClient.put(progressUrl(lessonId), JSON.stringify(snapshot), true, {
    'Content-Type': 'application/json',
  });
}

function clipWork(work: string | undefined): string | undefined {
  if (!work) return undefined;
  const limit = 4000;
  return work.length <= limit ? work : work.slice(0, limit) + '\n…truncated';
}

function formatEventsForPrompt(events: ProgressEvent[]): string {
  return events
    .map(e => {
      const label =
        e.type === 'checkpoint-completed'
          ? 'completed checkpoint'
          : 'ran their work in checkpoint';
      return `[${e.at}] ${label} #${e.checkpointIndex + 1} (${
        e.checkpointTitle
      })`;
    })
    .join('\n');
}

// Per-path progress for every hub in the lesson, as prompt lines.
// Empty string when the lesson has no hubs.
function formatHubStatus(
  lesson: LessonPlan,
  completedStepIds: string[]
): string {
  const lines: string[] = [];
  for (const step of lesson.steps) {
    if (step.kind !== 'hub') continue;
    lines.push(`Skill hub "${step.title}":`);
    for (const p of step.paths) {
      const ids = pathStepsFor(lesson, p);
      const done = ids.filter(id => completedStepIds.includes(id)).length;
      const standard = p.standard ? ` [standard: ${p.standard}]` : '';
      const objective = p.objective ? ` — ${p.objective}` : '';
      lines.push(
        `  - ${p.title}${standard}${objective}: ${done}/${ids.length} steps complete`
      );
    }
  }
  return lines.join('\n');
}

async function generateSummary(
  lesson: LessonPlan,
  events: ProgressEvent[],
  latestWork: string | undefined,
  completedStepIds: string[]
): Promise<string> {
  initAiLessonsGatewayContext();
  if (events.length === 0) return EMPTY_SUMMARY;

  const lessonOverview = [
    `Lesson title: ${lesson.title}`,
    `Lesson objective: ${lesson.objective}`,
    '',
    'Steps:',
    ...lesson.steps.map(
      (s, i) =>
        `  ${i + 1}. ${s.title} (${s.kind === 'lab' ? s.labType : s.kind})${
          s.kind !== 'panels' && s.description ? ` — ${s.description}` : ''
        }`
    ),
  ].join('\n');

  const hubStatus = formatHubStatus(lesson, completedStepIds);
  const hubSection = hubStatus
    ? `\n\nSkill-path progress (speak to these — name the paths and their
learning objectives, not step numbers):
${hubStatus}`
    : '';

  const work = latestWork
    ? `\n\nMost recent snapshot of the student's work:\n${clipWork(latestWork)}`
    : '';

  const prompt = `Summarise this student's progress through the lesson so far,
for their teacher to read.  Be specific about what they've actually done.
Two or three sentences, no more.

${lessonOverview}${hubSection}

Recent activity (most recent last):
${formatEventsForPrompt(events.slice(-30))}${work}`;

  try {
    const response = await loggedGenerateText('progress summary', {
      model: getModel(MODEL_ID),
      prompt,
      temperature: 0.3,
      output: summarySchema,
    });
    const raw = String(response.output?.summary || '').trim();
    return raw || EMPTY_SUMMARY;
  } catch {
    // Fall back to a structural summary if the LLM call fails.
    const completed = events.filter(
      e => e.type === 'checkpoint-completed'
    ).length;
    return `Student has completed ${completed} of ${lesson.steps.length} steps so far.`;
  }
}

interface RecordOptions {
  type: ProgressEventType;
  checkpointIndex: number;
  // The current full plan, so the summary can reference checkpoint titles.
  lesson: LessonPlan;
  // The student's live work at the moment of the event (optional).
  work?: string;
  // The previous snapshot (so we can append rather than overwrite).
  previous?: ProgressSnapshot;
  // Where the student is after this event: the visited-step path and the
  // step they're now on (for completions, the destination the resolver
  // chose).  Persisted so resume can restore branched positions.
  path?: string[];
  currentStepId?: string;
  // The branch option that produced this navigation, when there was one.
  branchOptionId?: string;
  // Completed step ids after this event (completions append the step).
  completedStepIds?: string[];
  // Latest checklist verdicts, carried on every event so tutor updates
  // between events aren't lost for long.
  checklist?: {[itemId: string]: boolean};
  // The mode this run is playing in, stamped on every event so the very
  // first snapshot already carries it.
  adaptivityMode?: AdaptivityMode;
}

// Merge extra fields (observations, checklist) into the latest snapshot
// and persist WITHOUT appending an event or regenerating the teacher
// summary.  Used for results that arrive between events — an
// observation finishing after its step was completed, for example —
// where riding the next event could lose them (there may be no next
// event).  Returns the persisted snapshot, or undefined when there is
// nothing to merge into yet.
export async function saveSnapshotExtras(
  lessonId: string,
  previous: ProgressSnapshot | undefined,
  extras: Partial<
    Pick<
      ProgressSnapshot,
      'observations' | 'checklist' | 'currentStepId' | 'mastery' | 'completed'
    >
  >
): Promise<ProgressSnapshot | undefined> {
  if (!previous) return undefined;
  const snapshot: ProgressSnapshot = {
    ...previous,
    ...extras,
    updatedAt: new Date().toISOString(),
  };
  try {
    await putProgress(lessonId, snapshot);
  } catch (e) {
    console.warn('Failed to persist snapshot extras', e);
  }
  return snapshot;
}

export async function recordProgressEvent(
  lessonId: string,
  options: RecordOptions
): Promise<ProgressSnapshot> {
  // Progress still speaks the v1 "checkpoint" vocabulary on the wire
  // (checkpointIndex etc.) so old snapshots keep loading; the whole
  // snapshot shape gets replaced by path-based progress in the
  // navigation rework.
  const step = options.lesson.steps[options.checkpointIndex];
  if (!step) {
    throw new Error(
      `Bad step index ${options.checkpointIndex} for lesson with ${options.lesson.steps.length} steps`
    );
  }
  const now = new Date().toISOString();

  const event: ProgressEvent = {
    type: options.type,
    checkpointIndex: options.checkpointIndex,
    checkpointId: step.id,
    checkpointTitle: step.title,
    at: now,
    workExcerpt: clipWork(options.work),
    branchOptionId: options.branchOptionId,
  };

  const baseEvents = options.previous?.events ?? [];
  const events = [...baseEvents, event].slice(-MAX_EVENTS_TO_KEEP);

  const isCompletion = options.type === 'checkpoint-completed';
  const lastCompletedCheckpointIndex = isCompletion
    ? options.checkpointIndex
    : options.previous?.lastCompletedCheckpointIndex ?? -1;
  const lastCompletedCheckpointId = isCompletion
    ? step.id
    : options.previous?.lastCompletedCheckpointId;

  const summary = await generateSummary(
    options.lesson,
    events,
    options.work,
    options.completedStepIds ?? options.previous?.completedStepIds ?? []
  );

  const snapshot: ProgressSnapshot = {
    lastCompletedCheckpointIndex,
    lastCompletedCheckpointId,
    totalCheckpoints: options.lesson.steps.length,
    summary,
    events,
    updatedAt: now,
    path: options.path ?? options.previous?.path,
    currentStepId: options.currentStepId ?? options.previous?.currentStepId,
    completedStepIds:
      options.completedStepIds ?? options.previous?.completedStepIds,
    checklist: options.checklist ?? options.previous?.checklist,
    observations: options.previous?.observations,
    mastery: options.previous?.mastery,
    // Sticky flags: a revisit after finishing must not un-complete the
    // lesson, and the run's mode survives events that don't restate it.
    completed: options.previous?.completed,
    adaptivityMode: options.adaptivityMode ?? options.previous?.adaptivityMode,
  };

  try {
    await putProgress(lessonId, snapshot);
  } catch (e) {
    console.warn('Failed to persist student progress', e);
  }

  return snapshot;
}

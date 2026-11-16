// Assembles what the AI Tutor should know about the pathway around a level
// step. Pure: the step passes the result to the lab as the level's system
// prompt, ahead of the lab's own tutor prompt.

import {
  CheckpointStatus,
  CheckpointStatusMap,
  ContinueUnlockReason,
  ValidationAttempt,
} from '../progress/model';
import {Checkpoint, LevelStep, Pathway, PathwayProjectInfo} from '../types';

import {ChatThresholds} from './validation/chatThresholds';

export interface TutorContextInput {
  pathway: Pathway;
  /** The checkpoint being played; the project view passes its synthetic one. */
  checkpoint: Checkpoint;
  step: LevelStep;
  statusMap: CheckpointStatusMap;
  /** The student's project, when the step edits it. */
  project?: PathwayProjectInfo;
  /** The instructions the student sees, generated or authored. */
  instructions?: string;
  /** The latest check of the student's work on this step, when one has run. */
  latestValidationAttempt?: ValidationAttempt;
  /** Why Continue is open on a checked step, while it is. */
  continueUnlocked?: ContinueUnlockReason;
  /** Where the chat alone opens Continue on a checked step. */
  chatThresholds?: ChatThresholds;
}

const UNLOCK_REASONS: {[reason in ContinueUnlockReason]: string} = {
  validationPassed: 'a build met the goal',
  failedValidations:
    'several builds were checked without passing, and the check can be wrong',
  replyLimit: 'the student has talked with you long enough',
};

const STATUS_HEADINGS: {[status in CheckpointStatus]: string} = {
  complete: 'Completed',
  skipped: 'Skipped, already demonstrated',
  inProgress: 'In progress',
  available: 'Not started',
  locked: 'Not started',
};

// Checkpoint statuses relevant to the tutor; locked reads as available.
const TUTOR_STATUSES: CheckpointStatus[] = [
  'complete',
  'skipped',
  'inProgress',
  'available',
];

function skillTitles(pathway: Pathway, ids: string[] | undefined): string[] {
  return (ids || []).map(id => pathway.skills[id]?.title ?? id);
}

function pathwaySection(pathway: Pathway): string {
  const skills = Object.values(pathway.skills).map(
    skill => `- ${skill.title}: ${skill.description}`
  );
  return [
    `Pathway: ${pathway.title}`,
    `Objective: ${pathway.objective}`,
    ...(skills.length ? ['Skills the pathway develops:', ...skills] : []),
  ].join('\n');
}

function checkpointSection(
  pathway: Pathway,
  checkpoint: Checkpoint,
  step: LevelStep
): string {
  const index = pathway.checkpoints.findIndex(c => c.id === checkpoint.id);
  const stepIndex = checkpoint.steps.findIndex(s => s.id === step.id);
  const position =
    index === -1
      ? 'The student is working on their project outside any checkpoint.'
      : `Current checkpoint (${index + 1} of ${pathway.checkpoints.length}): ${
          checkpoint.title
        }`;
  const skills = skillTitles(pathway, checkpoint.skillIds);
  return [
    position,
    index === -1 ? '' : checkpoint.description,
    skills.length ? `Skills in this checkpoint: ${skills.join(', ')}` : '',
    stepIndex === -1
      ? ''
      : `Step ${stepIndex + 1} of ${checkpoint.steps.length}: ${step.title}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function progressSection(
  pathway: Pathway,
  statusMap: CheckpointStatusMap
): string {
  // List each checkpoint grouped by its status.
  const lines = TUTOR_STATUSES.map(status => {
    const titles = pathway.checkpoints
      .filter(c => {
        const checkpointStatus = statusMap[c.id];
        // For tutor purposes, locked and available read the same.
        const statusToUse =
          checkpointStatus === 'locked' ? 'available' : checkpointStatus;
        return statusToUse === status;
      })
      .map(c => c.title);
    return titles.length
      ? `- ${STATUS_HEADINGS[status]}: ${titles.join(', ')}`
      : '';
  }).filter(Boolean);
  return lines.length ? ['Checkpoint progress:', ...lines].join('\n') : '';
}

function projectSection(project: TutorContextInput['project']): string {
  if (!project) return '';
  const name = project.name ? `"${project.name}"` : 'their project';
  return [
    `The student is editing their pathway project, ${name}. Changes made here persist across the pathway.`,
    project.description ? `Project description: ${project.description}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function checkSection({
  step,
  instructions,
  continueUnlocked,
  chatThresholds,
}: TutorContextInput): string {
  const {validation} = step;
  if (!validation) return '';
  const lines = [
    'How this step is checked:',
    `- Goal: ${validation.condition}`,
    instructions ? `- The instructions the student sees:\n${instructions}` : '',
    '- Only a build the student accepts from you is checked against the goal. Talking never triggers a check, so when the student is ready, offer to build.',
    continueUnlocked
      ? `- Continue is already open on this step: ${UNLOCK_REASONS[continueUnlocked]}. The student may move on whenever they like; keep helping if they want to meet the goal.`
      : '- Continue is locked until a build meets the goal.',
  ];
  if (!continueUnlocked && chatThresholds) {
    lines.push(
      `- For you alone, never to be told to the student: after ${chatThresholds.replyLimit} of your replies Continue opens regardless. Use the replies before then to keep the student engaged: draw out what they are trying to do, ask for real attempts, and steer each exchange toward a build that meets the goal.`
    );
  }
  return lines.filter(Boolean).join('\n');
}

function validationSection(
  latestValidationAttempt: TutorContextInput['latestValidationAttempt']
): string {
  if (!latestValidationAttempt) return '';
  return [
    `The latest check of the student's work on this step ${
      latestValidationAttempt.pass
        ? "met the step's goal"
        : "did not meet the step's goal yet"
    }. They were told: "${latestValidationAttempt.reason}"`,
    latestValidationAttempt.pass
      ? ''
      : 'Help them get there without doing the step for them.',
  ]
    .filter(Boolean)
    .join('\n');
}

/** The tutor's briefing on the pathway around a step, as one system prompt. */
export function buildTutorContext(input: TutorContextInput): string {
  const {
    pathway,
    checkpoint,
    step,
    statusMap,
    project,
    latestValidationAttempt,
  } = input;
  return [
    'The student is working through an adaptive pathway. Keep help tied to the current checkpoint and the pathway objective.',
    pathwaySection(pathway),
    checkpointSection(pathway, checkpoint, step),
    progressSection(pathway, statusMap),
    projectSection(project),
    checkSection(input),
    validationSection(latestValidationAttempt),
  ]
    .filter(Boolean)
    .join('\n\n');
}

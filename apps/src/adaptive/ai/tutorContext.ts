// Assembles what the AI Tutor should know about the pathway around a level
// step. Pure: the step passes the result to the lab as the level's system
// prompt, ahead of the lab's own tutor prompt.

import {CheckpointStatus, CheckpointStatusMap} from '../progress/model';
import {Checkpoint, LevelStep, Pathway} from '../types';

export interface TutorContextInput {
  pathway: Pathway;
  /** The checkpoint being played; the project view passes its synthetic one. */
  checkpoint: Checkpoint;
  step: LevelStep;
  statusMap: CheckpointStatusMap;
  /** The student's project, when the step edits it. */
  project?: {name?: string; description?: string};
}

const STATUS_HEADINGS: {[status in CheckpointStatus]: string} = {
  complete: 'Completed',
  inProgress: 'In progress',
  available: 'Not started',
  locked: 'Not started',
};

// Checkpoint statuses relevant to the tutor; locked reads as available.
const TUTOR_STATUSES: CheckpointStatus[] = [
  'complete',
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
  // List each checkpoint grouped by its status. For tutor purposes, available
  // and locked mean the same thing.
  const lines = TUTOR_STATUSES.map(status => {
    const titles = pathway.checkpoints
      .filter(c => {
        const s = statusMap[c.id];
        return status === 'available'
          ? s === 'available' || s === 'locked'
          : s === status;
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

/** The tutor's briefing on the pathway around a step, as one system prompt. */
export function buildTutorContext({
  pathway,
  checkpoint,
  step,
  statusMap,
  project,
}: TutorContextInput): string {
  return [
    'The student is working through an adaptive pathway. Keep help tied to the current checkpoint and the pathway objective.',
    pathwaySection(pathway),
    checkpointSection(pathway, checkpoint, step),
    progressSection(pathway, statusMap),
    projectSection(project),
  ]
    .filter(Boolean)
    .join('\n\n');
}

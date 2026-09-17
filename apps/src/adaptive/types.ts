import {LevelProperties} from '../lab2/types';

export interface AdaptiveLevelProperties extends LevelProperties {
  adaptiveId?: string;
  // Parsed dashboard/config/level_content/adaptive/<adaptiveId>.json.
  // Static content only, never per-user.
  adaptiveContent?: AdaptiveContent;
}

// One lesson's authored content. Steps play in array order unless a
// step's `next` says otherwise.
export interface AdaptiveContent {
  formatVersion: number;
  id: string;
  title: string;
  objective?: string;
  steps: Step[];
}

interface StepBase {
  id: string;
  title: string;
  // Step id to go to after this one, or 'end' to finish the lesson.
  // Absent means the next step in the array; the last step ends the lesson.
  next?: string | 'end';
}

export interface PanelSlide {
  caption: string;
  imageUrl?: string;
}

export interface PanelsStep extends StepBase {
  kind: 'panels';
  panels: PanelSlide[];
}

export interface QuestionOption {
  id: string;
  label: string;
  // Marks a right answer. A question with any correct option gates
  // progression until the chosen set matches exactly; one with none
  // records the answer and moves on.
  correct?: boolean;
}

export interface Question {
  id: string;
  type: 'multipleChoice';
  prompt: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

export interface QuestionStep extends StepBase {
  kind: 'question';
  questions: Question[];
}

export type Step = PanelsStep | QuestionStep;

// The latest submission for one question; `attempts` counts every
// submission, so a wrong-then-right answer reads attempts: 2.
export interface AnswerRecord {
  questionId: string;
  stepId: string;
  optionIds: string[];
  outcome: 'accepted' | 'correct' | 'incorrect';
  attempts: number;
  at: string;
}

export type Answers = {[questionId: string]: AnswerRecord};

// What is saved per user and level. The server stores it opaquely.
export interface AdaptiveProgress {
  currentStepId: string | null;
  // Visited step ids in order, including the current one.
  path: string[];
  completedStepIds: string[];
  answers: Answers;
  completed: boolean;
}

export function stepById(
  content: AdaptiveContent,
  stepId: string | null
): Step | undefined {
  return content.steps.find(step => step.id === stepId);
}

// Null means completing `stepId` ends the lesson.
export function nextStepId(
  content: AdaptiveContent,
  stepId: string
): string | null {
  const index = content.steps.findIndex(step => step.id === stepId);
  if (index < 0) return null;
  const explicit = content.steps[index].next;
  if (explicit === 'end') return null;
  if (explicit) return stepById(content, explicit) ? explicit : null;
  return content.steps[index + 1]?.id ?? null;
}

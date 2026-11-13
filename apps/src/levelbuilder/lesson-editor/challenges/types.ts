import type {Challenge, RubricEntry} from '@code-dot-org/lesson-deep-dive';

export type ChallengeModality = NonNullable<Challenge['default_modality']>;

export const CHALLENGE_MODALITIES: ChallengeModality[] = [
  'whiteboard',
  'video',
  'both',
];

// Mirrors Challenge#summarize_for_lesson_edit.
export interface ChallengeEditData {
  id: number;
  key: string;
  question: string;
  defaultModality: ChallengeModality | null;
  rubric: RubricEntry[] | null;
  whiteboardStarterImageAltText: string | null;
  whiteboardStarterImageUrl: string | null;
}

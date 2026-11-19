import {
  type AssessmentQuestionResult,
  type JsonVideoData,
  type LessonObjective,
  type PracticeProblem,
  type VocabularyItem,
} from '@code-dot-org/lesson-deep-dive';

export type LessonProgressCounts = {
  levelsTotalCount: number;
  levelsAttemptedCount: number;
  validatedLevelsTotalCount: number;
  validatedLevelsCorrectCount: number;
  validatedLevelsIncorrectCount: number;
};

export type LessonDeepDiveData = {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: VocabularyItem[];
  objectives: LessonObjective[];
  assessmentAnalysis: AssessmentQuestionResult[];
  jsonVideos: JsonVideoData[];
  practiceProblems: PracticeProblem[];
  progressCounts: LessonProgressCounts;
  timeSpentSeconds: number;
  unitLabel: string | null;
  nextLessonUrl: string | null;
};

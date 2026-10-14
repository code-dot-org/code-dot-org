import type {
  ProgressBubbleLevelType,
  ProgressBubbleStatus,
} from '@code-dot-org/component-library/progressWidget';

import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import {LevelKind, LevelStatus} from '@cdo/generated-scripts/sharedConstants';

/** The fields of a getCurrentLevels entry the widget reads. */
export interface WidgetLevel {
  id: string;
  url?: string;
  kind?: string;
  status?: string;
  levelNumber?: number;
  isConceptLevel?: boolean;
  isCurrentLevel?: boolean;
  isLocked?: boolean;
  teacherFeedbackReviewState?: string | null;
  bonus?: boolean;
  usesLab2?: boolean;
  sublevels?: WidgetLevel[];
}

const bubbleStatusByLevelStatus: Record<string, ProgressBubbleStatus> = {
  [LevelStatus.attempted]: 'inProgress',
  [LevelStatus.passed]: 'passed',
  [LevelStatus.perfect]: 'completed',
  [LevelStatus.free_play_complete]: 'completed',
  [LevelStatus.completed_assessment]: 'completed',
  [LevelStatus.submitted]: 'completed',
  [LevelStatus.review_accepted]: 'completed',
  [LevelStatus.review_rejected]: 'error',
};

const statusLabel: Record<ProgressBubbleStatus, string> = {
  notStarted: 'not started',
  inProgress: 'in progress',
  passed: 'passed',
  completed: 'completed',
  keepWorking: 'keep working',
  error: 'rejected',
};

export function bubbleStatus(level: WidgetLevel): ProgressBubbleStatus {
  // A teacher's "keep working" outranks whatever the level's result was.
  if (level.teacherFeedbackReviewState === ReviewStates.keepWorking) {
    return 'keepWorking';
  }
  return bubbleStatusByLevelStatus[level.status ?? ''] ?? 'notStarted';
}

export function bubbleLevelType(level: WidgetLevel): ProgressBubbleLevelType {
  return level.isConceptLevel ? 'panelLevel' : 'default';
}

export function isAssessment(level: WidgetLevel): boolean {
  return level.kind === LevelKind.assessment;
}

export function isActive(level: WidgetLevel): boolean {
  return (
    !!level.isCurrentLevel ||
    !!level.sublevels?.some(sublevel => sublevel.isCurrentLevel)
  );
}

export function bubbleAriaLabel(level: WidgetLevel): string {
  const status = level.isLocked ? 'locked' : statusLabel[bubbleStatus(level)];
  const levelNumber = level.levelNumber ?? '';
  return isAssessment(level)
    ? `Level ${levelNumber}, assessment, ${status}`
    : `Level ${levelNumber}, ${status}`;
}

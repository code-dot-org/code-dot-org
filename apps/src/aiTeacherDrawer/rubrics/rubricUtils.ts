import {LevelWithProgress} from '@cdo/apps/code-studio/teacherPanelTypes';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

export function computeBubbleStatus(
  level: LevelWithProgress | undefined,
  aiEvalStatus: string,
  hasTeacherFeedback: boolean
) {
  if (hasTeacherFeedback) {
    return 'EVALUATED';
  }
  if (aiEvalStatus === 'READY_TO_REVIEW') {
    return aiEvalStatus;
  }
  if (computeLevelStatus(level) === 'SUBMITTED') {
    return 'SUBMITTED';
  }
  return aiEvalStatus;
}

const computeLevelStatus = (level: LevelWithProgress | undefined) => {
  if (!level || level.status === LevelStatus.not_tried) {
    return 'NOT_STARTED';
  } else if (
    level.status === LevelStatus.attempted ||
    level.status === LevelStatus.passed
  ) {
    return 'IN_PROGRESS';
  } else if (
    level.status === LevelStatus.submitted ||
    level.status === LevelStatus.perfect ||
    level.status === LevelStatus.completed_assessment ||
    level.status === LevelStatus.free_play_complete
  ) {
    return 'SUBMITTED';
  } else {
    return null;
  }
};

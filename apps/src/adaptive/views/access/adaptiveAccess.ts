import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

export type AdaptiveAccess =
  | 'pending'
  | 'allowed'
  | 'unverifiedTeacher'
  | 'studentNoAccess'
  | 'studentNoSection';

export interface AdaptiveAccessUser {
  aiChatAccessLevel?: AiChatAccessLevel;
  userType: string;
  inSection: boolean | null;
}

export function adaptiveAccess(user: AdaptiveAccessUser): AdaptiveAccess {
  if (user.aiChatAccessLevel === undefined) return 'pending';

  if (user.aiChatAccessLevel !== AiChatAccessLevels.DISABLED) return 'allowed';
  if (user.userType === 'teacher') return 'unverifiedTeacher';
  return user.inSection ? 'studentNoAccess' : 'studentNoSection';
}

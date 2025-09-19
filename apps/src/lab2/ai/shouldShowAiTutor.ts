import {queryParams} from '@cdo/apps/code-studio/utils';

import {LABS_ALWAYS_USING_AI_TUTOR} from './aiTutorConstants';

export const shouldShowAiTutor = (
  appName: string,
  aiTutorAvailable: boolean | undefined
) => {
  return (
    LABS_ALWAYS_USING_AI_TUTOR.includes(appName) ||
    aiTutorAvailable ||
    queryParams('show-ai-tutor2') === 'true'
  );
};

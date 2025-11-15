import {queryParams} from '@cdo/apps/code-studio/utils';

// A list of app names for which AI Tutor is always on, regardless of
// level properties or experiment flags. Usage of AI tutor is still
// constrained by user permissions; if the user cannot use AI Tutor
// they will see an error message when trying to chat with it.
export const APPS_ALWAYS_USING_AI_TUTOR = ['weblab2'];

export const shouldShowAiTutor = (
  appName: string,
  aiTutorAvailable: boolean | undefined
) => {
  return (
    APPS_ALWAYS_USING_AI_TUTOR.includes(appName) ||
    aiTutorAvailable ||
    queryParams('show-ai-tutor2') === 'true' ||
    queryParams('show-ai-tutor') === 'true'
  );
};

// A list of app names for which AI Tutor is always on, regardless of
// level properties or experiment flags. Usage of AI tutor is still
// constrained by user permissions; if the user cannot use AI Tutor
// they will see an error message when trying to chat with it.
export const APPS_ALWAYS_USING_AI_TUTOR = ['weblab2'];

export const shouldShowAiTutor = ({
  appName,
  tutorLevel,
  tutorPilot,
  isProjectLevel,
}: {
  appName: string;
  tutorLevel?: boolean;
  tutorPilot?: boolean;
  isProjectLevel?: boolean;
}) => {
  return (
    APPS_ALWAYS_USING_AI_TUTOR.includes(appName) ||
    // user is in ai tutor pilot, and it's either a tutor enabled level or a project level
    (tutorPilot && (tutorLevel || isProjectLevel))
  );
};

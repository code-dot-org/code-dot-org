// Stub for @cdo/apps/util/experiments.
//
// The real module is CJS-in-ESM: apps/src/util/experiments.js uses `require()`
// and `module.exports`, which throws "module is not defined" outside webpack.
//
// Flags come from ?enableExperiments= only. The real module also persists to
// localStorage, which makes a page's experiment state depend on what earlier
// page loads did — a false-diff source when comparing renders.
//
// TODO: drop this once the feature reads experiments through core's plugin.

const enabled = new Set(
  (new URLSearchParams(window.location.search).get('enableExperiments') ?? '')
    .split(',')
    .filter(Boolean),
);

const experiments = {
  LESSON_TUTOR: 'lesson-tutor',
  LESSON_TUTOR_CHALLENGE: 'lesson-tutor-challenge',
  USE_LANGFUSE_PROMPT: 'use-langfuse-prompt',
  isEnabled: (key: string): boolean => enabled.has(key),
  isEnabledAllowingQueryString: (key: string): boolean => enabled.has(key),
};

export default experiments;

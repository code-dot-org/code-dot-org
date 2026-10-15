// Stub for @cdo/apps/util/experiments.
//
// The real module is CJS-in-ESM: apps/src/util/experiments.js uses `require()`
// and `module.exports`, which throws "module is not defined" outside webpack.
//
// The gates that decide whether this feature renders at all are on by default:
// booting the shell is already the decision to look at the feature, so making
// that a query parameter only hides it from whoever forgets. Anything else is
// off unless ?enableExperiments= names it.
//
// Unlike the real module this never writes to localStorage, so a page's
// experiment state does not depend on what earlier page loads did.
//
// TODO: drop this once the feature reads experiments through core's plugin.

const ALWAYS_ON = ['lesson-tutor', 'lesson-tutor-challenge'];

const enabled = new Set([
  ...ALWAYS_ON,
  ...(
    new URLSearchParams(window.location.search).get('enableExperiments') ?? ''
  )
    .split(',')
    .filter(Boolean),
]);

const experiments = {
  LESSON_TUTOR: 'lesson-tutor',
  LESSON_TUTOR_CHALLENGE: 'lesson-tutor-challenge',
  USE_LANGFUSE_PROMPT: 'use-langfuse-prompt',
  isEnabled: (key: string): boolean => enabled.has(key),
  isEnabledAllowingQueryString: (key: string): boolean => enabled.has(key),
};

export default experiments;

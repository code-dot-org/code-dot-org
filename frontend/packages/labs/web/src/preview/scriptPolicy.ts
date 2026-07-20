// Whether the student's scripts may run in the preview. Ported from the
// `allowUserScripts` rule in apps/src/weblab2/htmlPreview/HTMLPreview.tsx.
//
// This is not a sandbox flag: the answer drives `script-src` in the preview's
// content-security policy (see contentSecurityPolicy.ts), so a denial means the
// script never executes on the preview origin at all.

export interface ScriptPolicyInputs {
  /** The level asks for a prediction before the student sees the page run. */
  isPredictLevel: boolean;
  /** The student has committed to their prediction. */
  hasSubmittedPredictResponse: boolean;
  /** Levelbuilder start mode: an author editing the level's own start code. */
  isStartMode: boolean;
}

/**
 * Predict levels withhold the running page until the student has answered —
 * seeing the result first would defeat the prediction. Everyone else, and the
 * curriculum author working on the start code, runs scripts normally.
 */
export function allowUserScripts({
  isPredictLevel,
  hasSubmittedPredictResponse,
  isStartMode,
}: ScriptPolicyInputs): boolean {
  return !isPredictLevel || hasSubmittedPredictResponse || isStartMode;
}

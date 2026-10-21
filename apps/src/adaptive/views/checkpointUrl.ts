const CHECKPOINT_KEY = 'checkpoint';
const STEP_KEY = 'step';

export function checkpointStepFromUrl(): {
  checkpointId: string | undefined;
  stepId: string | undefined;
} {
  const p = new URLSearchParams(window.location.search);
  return {
    checkpointId: p.get(CHECKPOINT_KEY) ?? undefined,
    stepId: p.get(STEP_KEY) ?? undefined,
  };
}

// Pushes a new history entry for checkpointId+stepId. Skips if the URL
// already reflects those ids (popstate navigation or initial URL load).
export function updateUrl(checkpointId: string, stepId: string): void {
  const {checkpointId: currentCp, stepId: currentStep} =
    checkpointStepFromUrl();
  if (currentCp === checkpointId && currentStep === stepId) return;
  const p = new URLSearchParams(window.location.search);
  p.set(CHECKPOINT_KEY, checkpointId);
  p.set(STEP_KEY, stepId);
  window.history.pushState(null, '', `?${p.toString()}`);
}

export function clearUrl(): void {
  const p = new URLSearchParams(window.location.search);
  p.delete(CHECKPOINT_KEY);
  p.delete(STEP_KEY);
  const qs = p.toString();
  window.history.replaceState(
    null,
    '',
    qs ? `?${qs}` : window.location.pathname
  );
}

/*
  The consumer-supplied callback that surfaces contextual instructions for a
  given key (and optionally shows an overlay). Held as a module singleton rather
  than in Redux state: it is a non-serializable function, and nothing selects it
  reactively — the reducer only needs to invoke it as a side-effect.
*/

// The keys the consumer's instructions callback may be invoked with. Two
// groups: every panel name (fired on navigation, via SET_CURRENT_PANEL) plus
// contextual keys fired on specific in-panel interactions (dataset import,
// feature-column selection, the results-details toggle).
export type InstructionsKey =
  // Panels
  | 'selectDataset'
  | 'dataDisplayLabel'
  | 'dataDisplayFeatures'
  | 'trainModel'
  | 'generateResults'
  | 'results'
  | 'saveModel'
  | 'modelSummary'
  // Contextual
  | 'uploadedDataset'
  | 'selectedDataset'
  | 'selectedFeatureNumerical'
  | 'selectedFeatureCategorical'
  | 'resultsDetails';

type InstructionsKeyCallback = (
  key: InstructionsKey,
  options: {showOverlay?: boolean} | null,
) => void;

let instructionsKeyCallback: InstructionsKeyCallback | undefined;

export function setInstructionsKeyCallback(
  callback: InstructionsKeyCallback,
): void {
  instructionsKeyCallback = callback;
}

export function showInstructions(
  key: InstructionsKey,
  options: {showOverlay?: boolean} | null = null,
): void {
  instructionsKeyCallback?.(key, options);
}

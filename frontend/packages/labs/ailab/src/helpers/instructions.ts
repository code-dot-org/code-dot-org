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

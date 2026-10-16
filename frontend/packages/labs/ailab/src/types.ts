export type DataRow = Record<string, string | number>;

export type TrainerFamily = 'knn' | 'decisionTree';

export type Hyperparameters = {k: number} | {maxDepth: number};

export interface Mode {
  datasets?: string[];
  trainer?: TrainerFamily;
  label?: string;
  features?: string[];
  // Locks the label: `label` if set, else the dataset's default label.
  hideSelectLabel?: boolean;
  lockFeatures?: boolean;
  // Trains on `label` and `features` when the level loads. Requires both locks and `reserveLastRows`.
  pretrained?: boolean;
  // Opens on the results once pretrained, with no way back. Requires `pretrained`.
  hideDatasetView?: boolean;
  // Hides training, leaving only the dataset. Excludes `pretrained` and `requireAccuracy`.
  hideTestingView?: boolean;
  hideSave?: boolean;
  requireAccuracy?: number;
  hideInstructionsOverlay?: boolean;
  reserveLastRows?: boolean;
  hideColumnClicking?: boolean;
}

export interface ResultsData {
  examples: (string | number)[][];
  labels: (string | number)[];
  predictedLabels: (string | number)[];
}

export interface CategoricalColumnDetails {
  id: string;
  uniqueOptions: string[];
  frequencies: Record<string, number>;
}

export interface NumericalColumnDetails {
  id: string;
  extrema?: {min: number; max: number; range: number};
  containsOnlyNumbers: boolean;
}

export interface CurrentColumnInspector {
  id: string;
  readOnly: boolean;
  dataType: string;
  description: string;
  isSelectable: boolean;
}

export interface CrossTabResult {
  featureValues: (string | number)[];
  labelCounts: Record<string, number>;
  labelPercents?: Record<string, number>;
}

export interface CrossTabData {
  results: CrossTabResult[];
  uniqueLabelValues: string[];
  featureNames: string[];
  labelName: string;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface ScatterPlotData {
  label: string;
  feature: string;
  coordinates: Coordinate[];
}

export interface MetadataContext {
  createdBy?: string;
  potentialMisuses?: string;
  potentialUses?: string;
}

export interface MetadataCard {
  description?: string;
  context?: MetadataContext;
  lastUpdated?: string;
  source?: string;
}

export interface MetadataField {
  id?: string;
  description?: string;
  type?: 'numerical' | 'categorical';
}

export interface Metadata {
  name?: string;
  card: MetadataCard;
  defaultLabelColumn?: string;
  fields?: MetadataField[];
}

/* What the lab needs from a trained model, whichever algorithm made it. */
export interface TrainedModel {
  predict(rows: number[][]): (number | string)[];
  toJSON(): object;
}

export interface TrainedModelDetails {
  name?: string;
  potentialMisuses?: string;
  potentialUses?: string;
}

export interface TrainedModelDetailsSave {
  name?: string;
  potentialUses?: string;
  potentialMisuses?: string;
  datasetDescription?: string;
  columns?: {id: string; description: string}[];
  [key: string]: string | {id: string; description: string}[] | undefined;
}

export interface ModelCardColumn {
  id: string;
  description?: string;
  min?: number;
  max?: number;
  values?: string[];
}

export interface DatasetDetails {
  name: string;
  description: string;
  isUserUploaded: boolean;
  numRows: number;
  potentialUses?: string;
  potentialMisuses?: string;
}

export interface SaveResponseData {
  type?: string;
  content?: string[];
}

export interface SaveResponse {
  status: string;
  data?: SaveResponseData;
  id?: number;
}

export interface HistoricResult {
  label: string;
  features: string[];
  accuracy: string;
  correct: number;
  total: number;
}

/* Columns a level's mode fixes for the student, once a dataset has loaded. */
export interface PresetColumns {
  labelColumn?: string;
  selectedFeatures?: string[];
}

/* Everything saved with a student's work and restored when the level loads
   again. */
export interface AilabProject {
  labelColumn?: string;
  selectedFeatures: string[];
  hyperparameters?: Hyperparameters;
  accuracyCheckRowIndices?: number[];
  historicResults: HistoricResult[];
}

export const initialProject: AilabProject = {
  labelColumn: undefined,
  selectedFeatures: [],
  hyperparameters: undefined,
  accuracyCheckRowIndices: undefined,
  historicResults: [],
};

export interface ModelDataToSave {
  name?: string;
  datasetDetails: DatasetDetails;
  potentialUses?: string;
  potentialMisuses?: string;
  selectedTrainer: string;
  featureNumberKey: Record<string, Record<string, number>>;
  label: ModelCardColumn;
  features: ModelCardColumn[];
  summaryStat: {type: string; stat: string};
  trainedModel: object | null;
  hyperparameters: Hyperparameters | null;
}

export type SaveTrainedModel = (
  dataToSave: ModelDataToSave,
  callback: (response: SaveResponse) => void
) => void;

export interface NavButton {
  panel: Panel;
  text: string | undefined;
  enabled?: boolean;
}

export interface PrevNextButtons {
  prev?: NavButton;
  next?: NavButton;
}

export const CONTENT_PANELS = [
  'selectDataset',
  'datasetView',
  'results',
  'saveModel',
  'modelSummary',
] as const;

type ContentPanel = (typeof CONTENT_PANELS)[number];

// Valid panels are content panels + Continue/Finish targets.
export type Panel = ContentPanel | 'continue' | 'finish';

export type TrainingModalStep = 'training' | 'testing';

export const INSTRUCTIONS_KEYS = [
  ...CONTENT_PANELS,
  'uploadedDataset',
  'selectedDataset',
] as const;

export type InstructionsKey = (typeof INSTRUCTIONS_KEYS)[number];

export type DataRow = Record<string, string | number>;

export type AlgorithmId = 'knn' | 'decisionTree';

export type DataDisplayView = 'table' | 'cards';

export interface Mode {
  datasets?: string[];
  hideSelectLabel?: boolean;
  hideSave?: boolean;
  requireAccuracy?: number;
  hideInstructionsOverlay?: boolean;
  randomizeTestData?: boolean;
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

export type DecisionTreeLabel = number | string;

export type DecisionTreeNode =
  | {
      type: 'leaf';
      prediction: DecisionTreeLabel;
    }
  | {
      type: 'decision';
      featureIndex: number;
      splitType: 'categorical';
      defaultLabel: DecisionTreeLabel;
      children: Record<string, DecisionTreeNode>;
    }
  | {
      type: 'decision';
      featureIndex: number;
      splitType: 'numerical';
      threshold: number;
      defaultLabel: DecisionTreeLabel;
      left: DecisionTreeNode;
      right: DecisionTreeNode;
    };

export interface DecisionTreeModelData {
  algorithm: 'id3';
  root: DecisionTreeNode;
}

export interface PredictionModel {
  predict(dataset: number[][]): (number | string)[];
  toJSON(): object;
}

export interface TrainedModelResult {
  model: PredictionModel;
  predictedLabels: (number | string)[];
  kValue: number | null;
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
}

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
  kValue: number | null;
}

export type SaveTrainedModel = (
  dataToSave: ModelDataToSave,
  callback: (response: SaveResponse) => void,
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

export type ContentPanel =
  | 'selectAlgorithm'
  | 'selectDataset'
  | 'dataDisplayDataset'
  | 'dataDisplayLabel'
  | 'dataDisplayFeatures'
  | 'trainModel'
  | 'generateResults'
  | 'results'
  | 'exportModel'
  | 'modelSummary';

export type NavigationTabId =
  | 'dataset'
  | 'train'
  | 'test'
  | 'export';

export interface NavigationTab {
  id: NavigationTabId;
  text: string | undefined;
  panel: ContentPanel | undefined;
  enabled: boolean;
  selected: boolean;
}

// Valid panels are content panels + Continue/Finish targets.
export type Panel = ContentPanel | 'continue' | 'finish';

export type InstructionsKey =
  | ContentPanel
  | 'uploadedDataset'
  | 'selectedDataset'
  | 'selectedFeatureNumerical'
  | 'selectedFeatureCategorical'
  | 'resultsDetails';

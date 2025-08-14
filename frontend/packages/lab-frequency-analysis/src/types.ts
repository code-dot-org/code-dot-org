/** Describes a selectable message */
export interface FrequencyMessageData {
  title: string;
  message: string;
}

/** Describes the frequency of a particular letter */
export interface FrequencyDataPoint {
  /** The letter that this data point is for. */
  letter: string;
  /** The frequency of this letter */
  frequency: number;
}

/** The data context for the level */
export interface FrequencyData {
  /** A representation of the original letters in their alphabetical order */
  alphabetical: string[];
  /** A representation of the original letters */
  letters: string[];
  /** The letters available to use in the cipher */
  sourceLetters: string[];
  /** The frequency data for the language itself */
  data: FrequencyDataPoint[];
  /** The frequency data for the cipher message characters */
  sourceData: FrequencyDataPoint[];
  /** The current x-positions of the bars in the rendered graphs */
  positions: number[];
  /** The mapping from original letter to cipher letter */
  cipher: Map<string, string>;
}

export interface LabFrequencyAnalysisData {
  /** Which cipher type to show */
  mode: 'caesar' | 'substitution';
  /** The different messages to choose from to display */
  messages: FrequencyMessageData[];
}

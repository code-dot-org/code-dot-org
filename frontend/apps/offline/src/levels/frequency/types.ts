export interface FrequencyDataPoint {
  /** The letter that this data point is for. */
  letter: string;
  /** The frequency of this letter */
  frequency: number;
}

export interface FrequencyData {
  /** A representation of the original letters */
  letters: string[];
  /** The letters available to use in the cipher */
  sourceLetters: string[];
  /** The frequency data for the language itself */
  data: FrequencyData[];
  /** The frequency data for the cipher message characters */
  sourceData: FrequencyData[];
  /** The current x-positions of the bars in the rendered graphs */
  positions: number[];
  /** The mapping from original letter to cipher letter */
  cipher: Map<string, string>;
}

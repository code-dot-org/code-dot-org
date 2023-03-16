export interface TrackMetadata {
  /** Display name of the track */
  name: string;
  /** Whether this track was triggered or scheduled via standard playback */
  insideWhenRun: boolean;
  /** The current last measure of the track, i.e. the measure at which new sounds or rests will be added */
  currentMeasure: number;
  /** The maximum number of concurrent sounds in this track */
  maxConcurrentSounds: number;
}

export type EffectValue = 'normal' | 'medium' | 'low';

/**
 * Describes effects that can be applied to playback events.
 */
export interface Effects {
  volume?: EffectValue;
  filter?: EffectValue;
  delay?: EffectValue;
}

import {cachedWeightsMappings} from '../constants';
import {FieldKey, GeneratedEffect} from '../types';

// Returns the weights for each of the three emoji inputs for a given effect.
export function getGeneratedEffectScores(
  emojis: string[],
  effect: GeneratedEffect
): number[] {
  // Determine the contribution of each input emoji.
  const scores = emojis.map(emoji => {
    let sum = 0;
    for (const field of Object.values(FieldKey)) {
      const mapping = cachedWeightsMappings[field];
      sum +=
        mapping['emojiAssociations'][emoji][
          mapping['output'].indexOf(effect[field])
        ];
    }
    return sum;
  });
  return scores;
}

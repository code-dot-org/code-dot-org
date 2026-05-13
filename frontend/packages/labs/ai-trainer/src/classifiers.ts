import type {AlgorithmId, Creature, Label} from './dataset';
import {TRAINING_SET} from './dataset';

/**
 * Hand-rolled classifiers for the AI Trainer lab. Four algorithms — two
 * trivial baselines (always-majority, always-by-size) and two reasonable
 * approaches (nearest-neighbor, the correct rule). Each takes a test
 * creature and returns a predicted label plus a structured "explanation"
 * describing how it arrived at that prediction (used by the lab UI to
 * visualize the algorithm's reasoning).
 */

function featureDistance(a: Creature, b: Creature): number {
  // Squared distance treating eyes (1 vs 3) and size (small vs large) as
  // two binary dimensions. Eyes weighted more because that's the real signal.
  const eyeDist = a.eyes === b.eyes ? 0 : 1;
  const sizeDist = a.size === b.size ? 0 : 1;
  return eyeDist * 4 + sizeDist;
}

/** Per-row "why did the model predict this" data. */
export type Explanation =
  | {kind: 'majority'; friends: number; foes: number; chose: Label}
  | {kind: 'nearest-neighbor'; neighborId: number; distance: number}
  | {kind: 'rule'; feature: 'eyes' | 'size'; trigger: string};

interface PredictionDetail {
  predicted: Label;
  explanation: Explanation;
}

function predictDetailed(
  test: Creature,
  algorithm: AlgorithmId,
): PredictionDetail {
  switch (algorithm) {
    case 'majority': {
      const friends = TRAINING_SET.filter(r => r.label === 'friend').length;
      const foes = TRAINING_SET.length - friends;
      const chose: Label = friends >= foes ? 'friend' : 'foe';
      return {
        predicted: chose,
        explanation: {kind: 'majority', friends, foes, chose},
      };
    }
    case 'nearest-neighbor': {
      let best = TRAINING_SET[0];
      let bestDist = featureDistance(test, best);
      for (let i = 1; i < TRAINING_SET.length; i++) {
        const d = featureDistance(test, TRAINING_SET[i]);
        if (d < bestDist) {
          bestDist = d;
          best = TRAINING_SET[i];
        }
      }
      return {
        predicted: best.label,
        explanation: {
          kind: 'nearest-neighbor',
          neighborId: best.id,
          distance: bestDist,
        },
      };
    }
    case 'eyes-rule':
      return {
        predicted: test.eyes === 3 ? 'foe' : 'friend',
        explanation: {
          kind: 'rule',
          feature: 'eyes',
          trigger:
            test.eyes === 3 ? 'eyes = 3 → foe' : 'eyes = 1 → friend',
        },
      };
    case 'size-rule':
      return {
        predicted: test.size === 'large' ? 'foe' : 'friend',
        explanation: {
          kind: 'rule',
          feature: 'size',
          trigger:
            test.size === 'large' ? 'size = large → foe' : 'size = small → friend',
        },
      };
  }
}

export interface PredictionRow {
  creature: Creature;
  predicted: Label;
  correct: boolean;
  explanation: Explanation;
}

export interface RunResult {
  algorithm: AlgorithmId;
  predictions: PredictionRow[];
  correctCount: number;
  totalCount: number;
}

export function runOn(algorithm: AlgorithmId, testSet: Creature[]): RunResult {
  const predictions = testSet.map(creature => {
    const {predicted, explanation} = predictDetailed(creature, algorithm);
    return {creature, predicted, correct: predicted === creature.label, explanation};
  });
  return {
    algorithm,
    predictions,
    correctCount: predictions.filter(p => p.correct).length,
    totalCount: testSet.length,
  };
}

// @ts-expect-error — @code-dot-org/svm has no type declarations
import svmjs from '@code-dot-org/svm';

import {ClassType} from '../oceans/constants';

import type {FieldInfo} from './fishData';

/** svmjs training hyper-parameters. See https://github.com/karpathy/svmjs/blob/b75b71289dd81fc909a5b3fb8b1caf20fbe45121/lib/svm.js#L27 */
const SVM_PARAMS = {maxiter: 500};

/** Internal label used by the svmjs library for the "Like" class. */
const SVM_LABEL_LIKE = -1;
/** Internal label used by the svmjs library for the "Dislike" class. */
const SVM_LABEL_DISLIKE = 1;

/**
 * Mapping from ocean ClassType values (0/1) to svmjs labels (-1/1).
 * svmjs only accepts -1 and 1 as binary class labels.
 */
const CLASSTYPE_TO_SVM_LABEL: Record<number, number> = {
  [ClassType.Like]: SVM_LABEL_LIKE,
  [ClassType.Dislike]: SVM_LABEL_DISLIKE,
};

/**
 * Inverse mapping — converts svmjs labels back to ocean ClassType values.
 */
const SVM_LABEL_TO_CLASSTYPE: Record<number, number> = {
  [SVM_LABEL_LIKE]: ClassType.Like,
  [SVM_LABEL_DISLIKE]: ClassType.Dislike,
};

/** Result returned by {@link SVMTrainer.predict}. */
interface PredictionResult {
  /** The predicted ClassType value, or null when no training data exists. */
  predictedClassId: number | null;
  /** Per-class confidence scores keyed by ClassType value. */
  confidencesByClassId: Record<number, number>;
}

/** A single labeled training entry stored internally. */
interface LabeledDatum {
  /** The converted feature vector for this example. */
  example: number[];
  /** The svmjs-compatible label (-1 or 1). */
  label: number;
}

/**
 * A fish object as consumed by {@link SVMTrainer.explainFish}.
 * Matches the shape built by OceanObject after initFishData has run.
 */
interface FishLike {
  /** Flat feature vector combining all part knnData arrays. */
  knnData: number[];
  /** Per-field metadata aligned with knnData by index. */
  fieldInfos: FieldInfo[];
}

/** A single entry in the detailed weight breakdown produced by {@link SVMTrainer.detailedExplanation}. */
interface WeightEntry {
  /** Field metadata for this dimension. */
  fieldInfo: FieldInfo;
  /** Absolute value of the trained SVM weight for this dimension. */
  absWeight: number;
  /** Sign of the original weight: +1 means Dislike direction, -1 means Like direction. */
  sign: number;
}

/** A single entry in the per-part importance summary produced by {@link SVMTrainer.summarize}. */
interface PartImportance {
  /** Anatomical part category (e.g. "bodies", "eyes"). */
  partType: string;
  /** Normalized importance, in [0, 1], summing to 1 across all parts. */
  importance: number;
}

/** A single entry in the per-part impact breakdown produced by {@link SVMTrainer.explainFish}. */
interface PartImpact {
  /** Anatomical part category (e.g. "bodies", "eyes"). */
  partType: string;
  /**
   * Signed contribution of this part to the prediction.
   * Negative values pull toward Like; positive values pull toward Dislike.
   */
  impact: number;
}

/**
 * Returns the squared Euclidean magnitude of `vector`.
 * Used in {@link SVMTrainer.removeBiasTranslate} to normalize the weight vector.
 *
 * @param vector - Input numeric vector.
 * @returns ||vector||^2
 */
const magnitudeSquared = (vector: number[]): number => {
  let sum = 0;
  for (const x of vector) {
    sum += Math.pow(x, 2);
  }
  return sum;
};

/**
 * Wraps `@code-dot-org/svm` (svmjs) with the trainer interface used
 * by the ocean lab (addTrainingExample / train / predict / clearAll).
 *
 * Labels are translated between the ocean convention (Like=0, Dislike=1)
 * and svmjs convention (Like=-1, Dislike=1) on every boundary.
 */
export default class SVMTrainer<T = unknown> {
  /** Transforms an input example into a flat numeric feature vector. */
  private readonly converterFn: (input: T) => number[];

  /** The underlying svmjs SVM instance. Re-created on clearAll(). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private svm!: any;

  /** All labeled training examples accumulated since the last clearAll(). */
  private labeledTrainingData!: LabeledDatum[];

  /** The set of distinct svmjs labels seen in the training data. */
  private labelsSeen!: Set<number>;

  /**
   * @param converterFn - Transforms an ocean object into a flat numeric feature
   *   vector suitable for the SVM.  Defaults to identity (pass-through, assuming
   *   the input is already number[]).
   */
  constructor(converterFn?: (input: T) => number[]) {
    this.converterFn =
      converterFn ?? ((input: T) => input as unknown as number[]);
    this.initTrainingState();
  }

  /** Resets the SVM and clears all accumulated training data. */
  private initTrainingState(): void {
    this.svm = new svmjs.SVM();
    this.labeledTrainingData = [];
    this.labelsSeen = new Set();
  }

  /**
   * Appends a labeled example to the training buffer.
   *
   * The example is converted via `converterFn` and the classId is translated
   * from the ocean scheme (0/1) to the svmjs scheme (-1/1).
   *
   * @param example - The ocean object to train on.
   * @param classId - ClassType value (ClassType.Like or ClassType.Dislike).
   */
  addTrainingExample(example: T, classId: number): void {
    const convertedExample = this.converterFn(example);
    const svmLabel = CLASSTYPE_TO_SVM_LABEL[classId];
    this.labeledTrainingData.push({example: convertedExample, label: svmLabel});
    this.labelsSeen.add(svmLabel);
  }

  /**
   * Fits the SVM on all buffered training examples.
   *
   * No-op when fewer than two examples have been added, since svmjs
   * requires at least two data points to train.
   */
  train(): void {
    if (this.labeledTrainingData.length > 1) {
      const trainingData = this.labeledTrainingData.map(ld => ld.example);
      const trainingLabels = this.labeledTrainingData.map(ld => ld.label);
      this.svm.train(trainingData, trainingLabels, SVM_PARAMS);
    }
  }

  /**
   * Predicts the class for `example`.
   *
   * Returns `predictedClassId: null` when the training buffer is empty.
   * When only one class has been seen, returns that class with confidence 1
   * (mirroring KNNTrainer behavior for single-class datasets).
   *
   * @param example - The ocean object to classify.
   * @returns Prediction result with `predictedClassId` and per-class confidence map.
   */
  async predict(example: T): Promise<PredictionResult> {
    if (this.labeledTrainingData.length === 0) {
      return {
        predictedClassId: null,
        confidencesByClassId: {},
      };
    }

    let svmLabel: number;
    let confidence: number;

    /* The SVM library we use doesn't work unless there's at least one training data point of each label.
     * If there's only one label among the training data, to keep behavior consistent with KNN, return that label. */
    if (this.labelsSeen.size === 1) {
      svmLabel = Array.from(this.labelsSeen)[0];
      confidence = 1;
    } else {
      const inputVector = this.converterFn(example);
      svmLabel = (this.svm.predict([inputVector]) as number[])[0];
      confidence = Math.abs(this.svm.marginOne(inputVector) as number);
    }

    const predictedClassId = SVM_LABEL_TO_CLASSTYPE[svmLabel];
    const confidencesByClassId: Record<number, number> = {};
    confidencesByClassId[predictedClassId] = confidence;

    return {
      predictedClassId,
      confidencesByClassId,
    };
  }

  /** Discards all training data and reinitializes the SVM. */
  clearAll(): void {
    this.initTrainingState();
  }

  /**
   * Returns the absolute weight the trained model assigns to each input field,
   * sorted descending by absolute weight.
   *
   * @param fieldInfos - Per-field metadata aligned by index with the knnData
   *   vector.  Typically sourced from the Fish object used during training.
   * @returns Array of weight entries sorted by descending absWeight.
   */
  detailedExplanation(fieldInfos: FieldInfo[]): WeightEntry[] {
    const fieldsAndValues: WeightEntry[] = [];
    const weights = this.svm.w as number[];
    for (let i = 0; i < weights.length; i++) {
      fieldsAndValues.push({
        fieldInfo: fieldInfos[i],
        absWeight: Math.abs(weights[i]),
        sign: weights[i] >= 0 ? 1 : -1,
      });
    }
    fieldsAndValues.sort((a, b) => b.absWeight - a.absWeight);
    return fieldsAndValues;
  }

  /**
   * Returns a normalized per-part importance summary for the trained model.
   *
   * Aggregates weights across all fields belonging to each anatomical part,
   * treating id (one-hot) fields and attribute fields differently:
   * - id fields: take the per-part maximum (only one can fire per input).
   * - attribute fields: sum per part.
   *
   * Returns null when no nontrivial model is available (< 2 data points or
   * only one class in training data).
   *
   * @param fieldInfos - Per-field metadata aligned with the knnData vector.
   * @returns Normalized importance entries sorted descending, or null.
   */
  summarize(fieldInfos: FieldInfo[]): PartImportance[] | null {
    if (!this.hasNontrivialModel()) {
      return null;
    }

    const weightData = this.detailedExplanation(fieldInfos);

    /* separate the "id" fields, which are the fields generated by one-hot encoding the variation id for each part, with the "attribute"
     * fields, which are the hand-crafted metadata values such as number of teeth, since we need to treat the two differently in the summary. */
    const idFields = weightData.filter(d => d.fieldInfo.fieldType === 'id');
    const attributeFields = weightData.filter(
      d => d.fieldInfo.fieldType === 'attribute',
    );

    /* Aggregate all the fields generated by one-hot encoding back into one per part, since we don't want the number of variations for a part
     * to influence its weight.
     * Aggregate by picking the maximum value per part, since only one of these fields can be "used" for a particular input.
     * This is a heuristic from experimenting and seeing what "looks right", may not be ideal in all cases. - @winter */
    const idFieldsSummary: Record<string, number> = {};
    for (const fieldWithWeight of idFields) {
      const partType = fieldWithWeight.fieldInfo.partType;
      if (
        !Object.prototype.hasOwnProperty.call(idFieldsSummary, partType) ||
        fieldWithWeight.absWeight > idFieldsSummary[partType]
      ) {
        idFieldsSummary[partType] = fieldWithWeight.absWeight;
      }
    }

    // Sum all of the weights per part from the attribute fields and the idFieldsSummary. Result is a map of partType: totalAbsWeight.
    const rawSummary: Record<string, number> = {};
    for (const fieldWithWeight of attributeFields) {
      const partType = fieldWithWeight.fieldInfo.partType;
      if (!Object.prototype.hasOwnProperty.call(rawSummary, partType)) {
        rawSummary[partType] = 0;
      }
      rawSummary[partType] += fieldWithWeight.absWeight;
    }
    for (const [partType, weight] of Object.entries(idFieldsSummary)) {
      if (!Object.prototype.hasOwnProperty.call(rawSummary, partType)) {
        rawSummary[partType] = 0;
      }
      rawSummary[partType] += weight;
    }

    // Sort entries and convert to return format.
    const sortedSummary = Object.entries(rawSummary)
      .map(e => ({partType: e[0], importance: e[1]}))
      .sort((a, b) => b.importance - a.importance);

    // Normalize importance such that all of the importance values add up to 1. This lets us use results as percentages if we want.
    let denominator = 0;
    for (const partWithImportance of sortedSummary) {
      denominator += partWithImportance.importance;
    }
    return sortedSummary.map(p => ({
      partType: p.partType,
      importance: p.importance / denominator,
    }));
  }

  /**
   * Returns the signed per-part impact of each anatomical feature on the
   * prediction for a specific fish, after removing the bias term.
   *
   * A negative impact contributes toward "Like"; positive toward "Dislike".
   * Returns null when no nontrivial model is available.
   *
   * @param fish - The fish object to explain, supplying knnData and fieldInfos.
   * @returns Impact entries sorted by descending absolute impact, or null.
   */
  explainFish(fish: FishLike): PartImpact[] | null {
    if (!this.hasNontrivialModel()) {
      return null;
    }

    /* Translate the fish's data to "remove" the bias term from the model. The relative weights for each field don't always correspond to
     * contribution to prediction with a high bias value, which will happen for skewed data sets. */
    const translatedVector = this.removeBiasTranslate(fish.knnData);
    const weights = this.svm.w as number[];

    const impactByPart: Record<string, number> = {};
    for (let i = 0; i < weights.length; i++) {
      const partType = fish.fieldInfos[i].partType;
      if (!Object.prototype.hasOwnProperty.call(impactByPart, partType)) {
        impactByPart[partType] = 0;
      }
      impactByPart[partType] += weights[i] * translatedVector[i];
    }

    return Object.entries(impactByPart)
      .map(e => ({partType: e[0], impact: e[1]}))
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  /**
   * Translates `vector` so that the model gives the same prediction without
   * its bias term.
   *
   * For bias b, weights a, and input x the translation adds (b / ||a||^2) * a,
   * which moves the separating hyperplane along its normal until it passes
   * through the origin and applies the same shift to the input.
   *
   * @param vector - The input feature vector to translate.
   * @returns A new vector shifted to cancel the model's bias.
   */
  private removeBiasTranslate(vector: number[]): number[] {
    const weights = this.svm.w as number[];
    const bias = this.svm.b as number;
    const translationConstant = bias / magnitudeSquared(weights);
    const translationVector = weights.map(x => x * translationConstant);

    const result: number[] = [];
    for (let i = 0; i < vector.length; i++) {
      result[i] = vector[i] + translationVector[i];
    }
    return result;
  }

  /**
   * Predicts `vector` after removing the bias term.  Used only for testing
   * and validation of {@link removeBiasTranslate}.
   *
   * @param vector - The input feature vector.
   * @returns 1 if the translated margin is positive, 0 otherwise.
   */
  translatedPredict(vector: number[]): number {
    const translatedVector = this.removeBiasTranslate(vector);
    const weights = this.svm.w as number[];
    let margin = 0;
    for (let i = 0; i < translatedVector.length; i++) {
      margin += weights[i] * translatedVector[i];
    }
    return margin > 0 ? 1 : 0;
  }

  /**
   * Returns true when the trained model has at least one nonzero weight,
   * indicating that it can produce meaningful explanations.
   *
   * @returns Whether the model has a nontrivial weight vector.
   */
  hasNontrivialModel(): boolean {
    const weights = this.svm.w as number[] | undefined;
    return !!(weights && weights.find(weight => weight !== 0));
  }
}

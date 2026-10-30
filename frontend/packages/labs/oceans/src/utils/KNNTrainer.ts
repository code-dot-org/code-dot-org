import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

type Tensor = tf.Tensor;
type Converter<T> = (input: T) => Tensor;

interface PredictionResult {
  predictedClassId: number | null;
  confidencesByClassId: Record<string, number> | number[];
}

/**
 * Wraps `@tensorflow-models/knn-classifier` with the trainer interface used
 * by the ocean lab (addTrainingExample / predict / clearAll).
 *
 * KNN requires no training step — examples are stored as tensors and nearest-
 * neighbour lookup happens at predict time.
 */
export default class KNNTrainer<T = unknown> {
  private readonly converterFn: Converter<T>;
  private knn: knnClassifier.KNNClassifier;
  private TOPK: number | undefined;

  /**
   * @param converterFn - Transforms an ocean object into a TFJS Tensor for KNN lookup.
   *   Defaults to identity (pass-through).
   */
  constructor(converterFn?: Converter<T>) {
    this.converterFn =
      converterFn ?? ((input: T) => input as unknown as Tensor);
    this.knn = knnClassifier.create();
  }

  /**
   * Adds a labelled training example to the KNN dataset.
   *
   * @param example - The ocean object to classify.
   * @param classId - Class label (e.g. `ClassType.Like`).
   */
  addTrainingExample(example: T, classId: number): void {
    this.knn.addExample(this.converterFn(example), classId);
  }

  /** No-op — KNN does not require a separate training step. */
  train(): void {}

  /**
   * Predicts the class for `example` using the stored KNN dataset.
   *
   * @param example - The ocean object to classify.
   * @returns Prediction with `predictedClassId` and per-class confidence scores.
   */
  async predict(example: T): Promise<PredictionResult> {
    const result: PredictionResult = {
      predictedClassId: null,
      confidencesByClassId: [],
    };

    if (this.knn.getNumClasses() === 0) {
      return result;
    }

    const res = await this.knn.predictClass(
      this.converterFn(example),
      this.TOPK,
    );
    result.predictedClassId = parseInt(res.label);
    result.confidencesByClassId = res.confidences;
    return result;
  }

  /**
   * Sets the number of nearest neighbours to use during prediction.
   *
   * @param k - Top-K value passed to the KNN classifier.
   */
  setTopK(k: number): void {
    this.TOPK = k;
  }

  /** Disposes the current KNN dataset and creates a fresh classifier. */
  clearAll(): void {
    this.knn.dispose();
    this.knn = knnClassifier.create();
  }

  /** Releases TFJS memory held by the KNN classifier. */
  dispose(): void {
    this.knn.dispose();
  }

  /** Returns the number of distinct classes in the current dataset. */
  getNumClasses(): number {
    return this.knn.getNumClasses();
  }

  /**
   * Returns the number of training examples for `classId`.
   *
   * @param classId - The class label to query.
   * @returns Example count, or 0 if no dataset exists.
   */
  getExampleCount(classId: number): number {
    return this.knn ? this.knn.getClassExampleCount()[classId] : 0;
  }

  /**
   * Serialises the KNN dataset to a JSON string for persistence.
   *
   * TFJS does not provide a built-in serialisation API, so we extract the
   * raw tensor data manually.
   *
   * @returns JSON string representing the classifier dataset.
   */
  getDatasetJSON(): string {
    const dataset = this.knn.getClassifierDataset();
    const datasetObj: Record<string, {data: number[]; shape: number[]}> = {};
    Object.keys(dataset).forEach(key => {
      const data = dataset[key].dataSync();
      datasetObj[key] = {data: Array.from(data), shape: dataset[key].shape};
    });
    return JSON.stringify(datasetObj);
  }

  /**
   * Restores a KNN dataset from a previously serialised JSON string.
   *
   * @param datasetJson - JSON string returned by `getDatasetJSON`.
   */
  loadDatasetJSON(datasetJson: string): void {
    this.clearAll();
    const tensorObj = JSON.parse(datasetJson) as Record<
      string,
      {data: number[]; shape: number[]}
    >;
    Object.keys(tensorObj).forEach(key => {
      tensorObj[key] = tf.tensor(
        Array.from(tensorObj[key].data),
        tensorObj[key].shape,
      ) as unknown as {data: number[]; shape: number[]};
    });
    this.knn.setClassifierDataset(
      tensorObj as unknown as Record<string, tf.Tensor2D>,
    );
  }
}

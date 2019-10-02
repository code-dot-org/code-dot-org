import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

const TOPK = 10;

export default class SimpleTrainer {
  async initializeClassifiers() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();
  }

  clearAll() {
    this.knn.dispose();
    this.knn = knnClassifier.create();
  }

  getNumClasses() {
    return this.knn.getNumClasses();
  }

  /**
   * @param {number} classId
   * @returns number
   */
  getExampleCount(classId) {
    return this.knn ? this.knn.getClassExampleCount()[classId] : 0;
  }

  /**
   * @param {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} imageOrVideoElement
   * @param {number} classId
   */
  addExample(imageOrVideoElement, classId) {
    const image = tf.fromPixels(imageOrVideoElement);
    const infer = () => this.mobilenet.infer(image, 'conv_preds');

    let logits;
    if (classId !== -1) {
      logits = infer();
      this.knn.addExample(logits, classId);
    }
    image.dispose();
    if (logits) {
      logits.dispose();
    }
  }

  /**
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predict(videoElement) {
    const image = tf.fromPixels(videoElement);
    const infer = () => this.mobilenet.infer(image, 'conv_preds');
    let result = {
      predictedClassId: null,
      confidencesByClassId: []
    };

    const numClasses = this.knn.getNumClasses();
    if (numClasses > 0) {
      let logits = infer();

      const res = await this.knn.predictClass(logits, TOPK);

      result.predictedClassId = res.classIndex;
      result.confidencesByClassId = res.confidences;

      if (logits) {
        logits.dispose();
      }
    }

    image.dispose();

    return result;
  }
}

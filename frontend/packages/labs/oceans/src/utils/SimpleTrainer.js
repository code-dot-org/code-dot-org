import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

const TOPK = 10;

module.exports = class SimpleTrainer {
  constructor() {
  }

  async initializeClassifiers() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();
  }

  getNumClasses() {
    return this.knn.getNumClasses();
  }

  /**
   * @param {number} classId
   * @returns number
   */
  getExampleCount(classId) {
    return this.knn ? this.knn.getClassExampleCount[classId] : 0;
  }

  /**
   * @param {HTMLVideoElement} vidoeElement
   * @param {number} classId
   */
  addExample(vidoeElement, classId) {
    const image = tf.fromPixels(vidoeElement);
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
};

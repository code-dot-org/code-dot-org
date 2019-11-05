import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

export default class SimpleTrainer {
  async initializeClassifiers() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();
  }

  initializeClassifiersWithoutMobilenet() {
    this.knn = knnClassifier.create();
  }

  setTopK(k) {
    this.TOPK = k;
  }

  clearAll() {
    this.knn.dispose();
    this.knn = knnClassifier.create();
  }

  dispose() {
    this.knn.dispose();
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
   * @param {Array<number>} KNN data
   * @param {number} classId
   */
  addExampleTensor(tensor, classId) {
    this.knn.addExample(tensor, classId);
  }

  /**
   * @param {ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} imageOrVideoElement
   * @param {number} classId
   */
  addExampleImage(imageOrVideoElement, classId) {
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
   * @param {Array<number>} KNN data
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predictFromTensor(tensor) {
    let result = {
      predictedClassId: null,
      confidencesByClassId: []
    };
    const numClasses = this.knn.getNumClasses();
    if (numClasses > 0) {
      const res = await this.knn.predictClass(tensor, this.TOPK);

      result.predictedClassId = res.classIndex;
      result.confidencesByClassId = res.confidences;
    }
    return result;
  }

  /**
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predictFromImage(videoElement) {
    const image = tf.fromPixels(videoElement);
    const infer = () => this.mobilenet.infer(image, 'conv_preds');
    let result = {
      predictedClassId: null,
      confidencesByClassId: []
    };

    const numClasses = this.knn.getNumClasses();
    if (numClasses > 0) {
      let logits = infer();

      const res = await this.knn.predictClass(logits, this.TOPK);

      result.predictedClassId = res.classIndex;
      result.confidencesByClassId = res.confidences;

      if (logits) {
        logits.dispose();
      }
    }

    image.dispose();

    return result;
  }

  /*
   * TFJS doesn't provide a great way to serialize a model and restore it so
   * we have to hack one ourselves. This is largely based on the examples at
   * https://github.com/tensorflow/tfjs/issues/633#issuecomment-456308218
   * with some customization and updates from documentation.
   * /

  /**
   * @returns {string}
   */
  getDatasetJSON() {
    let dataset = this.knn.getClassifierDataset();
    var datasetObj = {};
    Object.keys(dataset).forEach(key => {
      let data = dataset[key].dataSync();
      datasetObj[key] = {data: Array.from(data), shape: dataset[key].shape};
    });
    return JSON.stringify(datasetObj);
  }

  /**
   * @param {string} datasetJson
   */
  loadDatasetJSON(datasetJson) {
    const tensorObj = JSON.parse(datasetJson);
    Object.keys(tensorObj).forEach(key => {
      tensorObj[key] = tf.tensor(
        Array.from(tensorObj[key].data),
        tensorObj[key].shape
      );
    });
    this.knn.setClassifierDataset(tensorObj);
  }

  /**
   * @param {object} tensorObj
   */
  loadDataset(tensorObj) {
    Object.keys(tensorObj).forEach(key => {
      tensorObj[key] = tf.tensor(
        Array.from(tensorObj[key].data),
        tensorObj[key].shape
      );
    });
    this.knn.setClassifierDataset(tensorObj);
  }
}

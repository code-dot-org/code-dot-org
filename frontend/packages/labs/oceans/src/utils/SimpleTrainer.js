import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

export default class SimpleTrainer {
  constructor(converterFn) {
    this.converterFn = converterFn || (input => input); // Default to returning example as-is
    this.knn = knnClassifier.create();
  }

  /**
   * @param {Object} training data point
   * @param {number} classId
   */
  addTrainingExample(example, classId) {
    this.knn.addExample(this.converterFn(example), classId);
  }

  train() {} // no training needed for KNN

  /**
   * @param {Tensor<number>} KNN data
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predict(example) {
    let result = {
      predictedClassId: null,
      confidencesByClassId: []
    };

    if (this.knn.getNumClasses() === 0) {
      return result;
    }

    const res = await this.knn.predictClass(this.converterFn(example), this.TOPK);
    result.predictedClassId = parseInt(res.label);
    result.confidencesByClassId = res.confidences;
    return result;
  }

  // SimpleTrainer-specific methods below

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
    this.clearAll();
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
  loadDataset(dataset) {
    this.clearAll();
    let tensorObj = {...dataset};
    Object.keys(tensorObj).forEach(key => {
      tensorObj[key] = tf.tensor(
        Array.from(tensorObj[key].data),
        tensorObj[key].shape
      );
    });
    this.knn.setClassifierDataset(tensorObj);
  }
}

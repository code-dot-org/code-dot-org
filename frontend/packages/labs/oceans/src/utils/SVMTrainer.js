const svmjs = require('svm'); // https://github.com/karpathy/svmjs

export default class SVMTrainer {
  constructor(converterFn) {
    // Default to returning example as-is
    this.converterFn = converterFn || (input => input);
    this.svm = new svmjs.SVM();
    this.svmParams = {C: 1.0};
    this.labeledTrainingData = [];
  }

  /**
   * @param {Array<number>} data
   * @param {number} classId
   */
  addTrainingExample(example, classId) {
    // This SVM library only accepts 1 and -1 as labels; convert from our 0/1 labeling scheme
    const convertedExample = this.converterFn(example);
    const svmLabel = (classId === 1 ? 1 : -1);
    this.labeledTrainingData.push({example: convertedExample, label: svmLabel});
  }

  train() {
    if (this.labeledTrainingData.length > 0) {
      const trainingData = this.labeledTrainingData.map(ld => ld.example);
      const trainingLabels = this.labeledTrainingData.map(ld => ld.label);
      this.svm.train(trainingData, trainingLabels, this.svmParams);
    }
  }

  /**
   * @param {Array<number>} data
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predict(example) {
    let result = {
      predictedClassId: null,
      confidencesByClassId: []
    };

    if (this.labeledTrainingData.length === 0) {
      return result;
    }

    const res = this.svm.predict([this.converterFn(example)]);

    // This SVM library uses 1 and -1 as labels; convert back to our 0/1 labeling scheme
    result.predictedClassId = res[0] === 1 ? 1 : 0;
    const confidences = {};
    confidences[result.predictedClassId] = 1; // TODO: Not sure if SVM has a concept of confidence (distance from boundary?)
    result.confidencesByClassId = confidences;
    return result;
  }
}

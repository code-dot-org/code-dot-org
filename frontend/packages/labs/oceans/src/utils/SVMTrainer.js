const svmjs = require('svm'); // https://github.com/karpathy/svmjs

export default class SVMTrainer {
  constructor() {
    this.svm = new svmjs.SVM();
    this.svmParams = {C: 1.0};
    this.labeledTrainingData = [];
    this.classes = new Set();
  }

  // TODO: clean up interface
  async init() {
  }

  /**
   * @param {Array<number>} data
   * @param {number} classId
   */
  addTrainingExample(example, classId) {
    // This SVM library only accepts 1 and -1 as labels; convert from our 0/1 labeling scheme
    const svmLabel = (classId === 1 ? 1 : -1);
    this.labeledTrainingData.push({example: example, label: svmLabel});
    this.classes.add(classId);
  }

  getNumClasses() {
    return this.classes.size;
  }

  train() {
    if (this.getNumClasses() > 0) {
      const trainingData = this.labeledTrainingData.map(ld => ld.example);
      const trainingLabels = this.labeledTrainingData.map(ld => ld.label);
      this.svm.train(trainingData, trainingLabels, this.svmParams);
    }
  }

  /**
   * @param {Array<number>} data
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predictFromExample(example) {
    let result = {
      predictedClassId: null,
      confidencesByClassId: []
    };
    const numClasses = this.getNumClasses();
    if (numClasses > 0) {
      const res = this.svm.predict([example]);

      // This SVM library uses 1 and -1 as labels; convert back to our 0/1 labeling scheme
      result.predictedClassId = res[0] === 1 ? 1 : 0;

      const confidences = {};
      confidences[result.predictedClassId] = 1; // TODO: Not sure if SVM has a concept of confidence (distance from separating hyperplane?)
      result.confidencesByClassId = confidences;
    }
    return result;
  }
}

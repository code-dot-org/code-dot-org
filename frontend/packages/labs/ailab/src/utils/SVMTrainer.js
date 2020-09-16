const svmjs = require("svm");

export default class SVMTrainer {
  constructor(converterFn) {
    this.converterFn = converterFn || (input => input); // Default to returning example as-is
    this.initTrainingState();
  }

  initTrainingState() {
    this.svm = new svmjs.SVM();
    this.labeledTrainingData = [];
    this.labelsSeen = new Set();
  }

  /**
   * @param {Array<number>} data
   * @param {number} classId
   */
  addTrainingExample(example, classId) {
    // This SVM library only accepts 1 and -1 as labels; convert from our 0/1 labeling scheme
    const convertedExample = this.converterFn(example);
    const svmLabel = CLASSTYPE_TO_SVM_LABEL[classId];
    this.labeledTrainingData.push({
      example: convertedExample,
      label: svmLabel
    });
    this.labelsSeen.add(svmLabel);
  }

  train() {
    if (this.labeledTrainingData.length > 1) {
      const trainingData = this.labeledTrainingData.map(ld => ld.example);
      const trainingLabels = this.labeledTrainingData.map(ld => ld.label);
      this.svm.train(trainingData, trainingLabels, SVM_PARAMS);
    }
  }

  /**
   * @param {Array<number>} data
   * @returns {Promise<{confidencesByClassId: [], predictedClassId: null}>}
   */
  async predict(example) {
    if (this.labeledTrainingData.length === 0) {
      return {
        predictedClassId: null,
        confidencesByClassId: {}
      };
    }

    let svmLabel, confidence;
    /* The SVM library we use doesn't work unless there's at least one training data point of each label.
     * If there's only one label among the training data, to keep behavior consistent with KNN, return that label. */
    if (this.labelsSeen.size === 1) {
      svmLabel = Array.from(this.labelsSeen)[0];
      confidence = 1;
    } else {
      const inputVector = this.converterFn(example);
      svmLabel = this.svm.predict([inputVector])[0];
      confidence = Math.abs(this.svm.marginOne(inputVector));
    }

    // This SVM library uses 1 and -1 as labels; convert back to our 0/1 labeling scheme
    const predictedClassId = SVM_LABEL_TO_CLASSTYPE[svmLabel];
    const confidences = {};
    confidences[predictedClassId] = confidence;

    return {
      predictedClassId: predictedClassId,
      confidencesByClassId: confidences
    };
  }

  clearAll() {
    this.initTrainingState();
  }
}

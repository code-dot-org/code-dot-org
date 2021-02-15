import KNN from 'ml-knn';
import SVM from 'ml-svm';

const KNNTrainers = ['knnClassify', 'knnRegress'];
const SVMTrainers = ['binarySvm'];

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

/*

modelData = {
  selectedTrainer: "selectedTrainer",
  trainedModel: <JSON blob of trained model>,
  featureNumberKey: {
    feature1: {
      value1: convertedValue1,
      value2: convertedValue2
    },
    feature2: {
      value1: convertedValue1,
      value2: convertedValue2
    }
  },
  labelColumn: "labelColumn",
  selectedFeatures: ["feature1", "feature2"],
  testData: {
    feature1: value,
    feature2: value,
    feature3: value
  }
}

  value in testData is the converted algorithm-ready number, not the string

  TODO: convert string data in testValues using the featureNumberKey
*/
export function predict(modelData) {
  let model;
  if (KNNTrainers.includes(modelData.selectedTrainer)) {
    model = KNN.load(modelData.trainedModel);
  } else if (SVMTrainers.includes(modelData.selectedTrainer)) {
    model = SVM.load(modelData.trainedModel);
  } else {
    return 'Error: unknown trainer';
  }
  const testValues = modelData.selectedFeatures.map(feature =>
    parseInt(modelData.testData[feature])
  );
  const rawPrediction = model.predict(testValues);
  const prediction = Object.keys(modelData.featureNumberKey).includes(
    modelData.labelColumn
  )
    ? getKeyByValue(
        modelData.featureNumberKey[modelData.labelColumn],
        rawPrediction
      )
    : parseFloat(rawPrediction);
  return prediction;
}

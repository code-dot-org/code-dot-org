const KNN = require('ml-knn');

const KNNTrainers = ['knnClassify', 'knnRegress'];

/* NEED: testData, selectedFeatures, featureNumberKey, selectedTrainer, labelColumn and trainedModel

testData = {
  feature1: value,
  feature2: value,
  feature3: value
}
where value is the converted number, not the string
*/

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

export function predict(modelData) {
  // Determine which algorithm to use.
  if (KNNTrainers.includes(modelData.selectedTrainer)) {
    // Re-instantiate the trained model.
    const model = KNN.load(modelData.trainedModel);
    // Prepare test data.
    const testValues = modelData.selectedFeatures.map(
      feature => modelData.testData[feature]
    );

    // Make a prediction.
    const rawPrediction = model.predict(testValues)[0];
    // Convert prediction to human readable (if needed)
    const prediction = Object.keys(modelData.featureNumberKey).includes(
      modelData.labelColumn
    )
      ? getKeyByValue(
          modelData.featureNumberKey[modelData.labelColumn],
          rawPrediction
        )
      : parseFloat(rawPrediction);
    return prediction;
  } else {
    return 'Error: unknown trainer';
  }
}

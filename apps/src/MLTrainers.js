import KNN from 'ml-knn';
import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';

const KNNTrainers = ['knnClassify', 'knnRegress'];

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
  label: {
    id: "labelName",
    description: "details about the column",
    max: "highest value if column contains numerical data",
    min: "lowest value if column contains numerical data",
    values: ["category1", "category2"]
  },
  features: [
    {
      id: "feature1",
      description: "details about the column",
      max: "highest value if column contains numerical data",
      min: "lowest value if column contains numerical data",
      values: ["category1", "category2"]
    },
   {
      id: "feature2",
      description: "details about the column",
      max: "highest value if column contains numerical data",
      min: "lowest value if column contains numerical data",
      values: ["category1", "category2"]
    }
  ],
  testData: {
    feature1: value,
    feature2: value,
    feature3: value
  }
}
*/

function convertTestValue(featureNumberKey, feature, value) {
  const convertedValue = Object.keys(featureNumberKey).includes(feature)
    ? featureNumberKey[feature][value]
    : value;
  return parseInt(convertedValue);
}

export function predict(modelData) {
  // Determine which algorithm to use.
  if (KNNTrainers.includes(modelData.selectedTrainer)) {
    // Re-instantiate the trained model.
    const model = KNN.load(modelData.trainedModel);
    // Prepare test data.
    const features = modelData.features
      ? modelData.features.map(feature => feature.id)
      : modelData.selectedFeatures;

    const testValues = features.map(feature =>
      convertTestValue(
        modelData.featureNumberKey,
        feature,
        modelData.testData[stripSpaceAndSpecial(feature)]
      )
    );
    // Make a prediction.
    const rawPrediction = model.predict(testValues);
    // Convert prediction to human readable (if needed)

    const label = modelData.label ? modelData.label.id : model.labelColumn;

    const prediction = Object.keys(modelData.featureNumberKey).includes(label)
      ? getKeyByValue(modelData.featureNumberKey[label], rawPrediction)
      : parseFloat(rawPrediction);
    return prediction;
  } else {
    return 'Error: unknown trainer';
  }
}

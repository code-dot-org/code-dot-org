import KNN from 'ml-knn';

import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';

const KNNTrainers = ['knnClassify', 'knnRegress'];
const ID3Trainers = ['id3Classify', 'id3Regress'];

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
  return parseFloat(convertedValue);
}

function predictDecisionTreeNode(node, testValues) {
  if (node.type === 'leaf') {
    return node.prediction;
  }

  const value = testValues[node.featureIndex];
  if (node.splitType === 'numerical') {
    const child = value <= node.threshold ? node.left : node.right;
    return child
      ? predictDecisionTreeNode(child, testValues)
      : node.defaultLabel;
  }

  const child = node.children[String(value)];
  return child ? predictDecisionTreeNode(child, testValues) : node.defaultLabel;
}

function convertPrediction(featureNumberKey, label, rawPrediction) {
  return Object.keys(featureNumberKey).includes(label)
    ? getKeyByValue(featureNumberKey[label], rawPrediction)
    : parseFloat(rawPrediction);
}

function getModelFeatures(modelData) {
  return modelData.features
    ? modelData.features.map(feature => feature.id)
    : modelData.selectedFeatures;
}

function getTestValues(modelData, features) {
  return features.map(feature =>
    convertTestValue(
      modelData.featureNumberKey,
      feature,
      modelData.testData[stripSpaceAndSpecial(feature)]
    )
  );
}

export function predict(modelData) {
  // Determine which algorithm to use.
  if (KNNTrainers.includes(modelData.selectedTrainer)) {
    // Re-instantiate the trained model.
    const model = KNN.load(modelData.trainedModel);
    // Prepare test data.
    const features = getModelFeatures(modelData);
    const testValues = getTestValues(modelData, features);
    // Make a prediction.
    const rawPrediction = model.predict(testValues);
    // Convert prediction to human readable (if needed)

    const label = modelData.label ? modelData.label.id : model.labelColumn;

    return convertPrediction(modelData.featureNumberKey, label, rawPrediction);
  }

  if (ID3Trainers.includes(modelData.selectedTrainer)) {
    const features = getModelFeatures(modelData);
    const testValues = getTestValues(modelData, features);
    const label = modelData.label ? modelData.label.id : modelData.labelColumn;
    const root = modelData.trainedModel.root || modelData.trainedModel;
    const rawPrediction = predictDecisionTreeNode(root, testValues);
    return convertPrediction(modelData.featureNumberKey, label, rawPrediction);
  }

  return 'Error: unknown trainer';
}

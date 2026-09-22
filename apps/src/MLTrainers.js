import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
import KNN from 'ml-knn';

import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';

const KNNTrainers = ['knnClassify', 'knnRegress'];

const treeKindsByTrainer = {
  treeClassify: DecisionTreeClassifier,
  treeRegress: DecisionTreeRegression,
};

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

// A record of training, not a prediction input: KNN.load already restores k.
export function getHyperparameters(modelData) {
  if (modelData.hyperparameters) {
    return modelData.hyperparameters;
  }
  // Models saved before hyperparameters were added carry only kValue, and S3 keeps them forever.
  if (typeof modelData.kValue === 'number') {
    return {k: modelData.kValue};
  }
  return {};
}

export function predict(modelData) {
  // Determine which algorithm to use.
  const isKNN = KNNTrainers.includes(modelData.selectedTrainer);
  const TreeKind = Object.hasOwn(treeKindsByTrainer, modelData.selectedTrainer)
    ? treeKindsByTrainer[modelData.selectedTrainer]
    : undefined;

  if (!isKNN && !TreeKind) {
    return 'Error: unknown trainer';
  }

  // Re-instantiate the trained model.
  const model = isKNN
    ? KNN.load(modelData.trainedModel)
    : TreeKind.load(modelData.trainedModel);
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
  // A tree predicts a list of rows, so wrap the one row and unwrap its result.
  const rawPrediction = isKNN
    ? model.predict(testValues)
    : model.predict([testValues])[0];
  // Convert prediction to human readable (if needed)

  const label = modelData.label ? modelData.label.id : model.labelColumn;

  const prediction = Object.keys(modelData.featureNumberKey).includes(label)
    ? getKeyByValue(modelData.featureNumberKey[label], rawPrediction)
    : parseFloat(rawPrediction);
  return prediction;
}

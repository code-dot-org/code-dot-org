import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
import KNN from 'ml-knn';

import {stripSpaceAndSpecial} from '@cdo/apps/aiUtils';

const KNNTrainers = ['knnClassify', 'knnRegress'];

const treeTrainers = {
  treeClassify: DecisionTreeClassifier,
  treeRegress: DecisionTreeRegression,
};

export const PREDICTION_FAILED = 'Error: prediction failed';
export const UNKNOWN_TRAINER = 'Error: unknown trainer';

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

/*

modelData = {
  selectedTrainer: "selectedTrainer",
  trainedModel: <JSON blob of trained model>,
  hyperparameters: {
    // the values the trainer chose, e.g. {k: 5} or {maxDepth: 3}
  },
  kValue: <legacy, KNN only; superseded by hyperparameters.k>,
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

/*
  The hyperparameters a model was trained with. Models saved before the
  `hyperparameters` object carry only the top-level `kValue`.
*/
export function getHyperparameters(modelData) {
  if (modelData.hyperparameters) {
    return modelData.hyperparameters;
  }
  return modelData.kValue === undefined || modelData.kValue === null
    ? {}
    : {k: modelData.kValue};
}

/*
  parseFloat, not parseInt: the lab trains on the result of parseFloat, so
  truncating here would send the model a value it never saw. A categorical
  value resolves through featureNumberKey first, and its integer is
  unaffected.
*/
function convertTestValue(featureNumberKey, feature, value) {
  const convertedValue = Object.keys(featureNumberKey).includes(feature)
    ? featureNumberKey[feature][value]
    : value;
  return parseFloat(convertedValue);
}

function prepareTestValues(modelData) {
  const features = modelData.features
    ? modelData.features.map(feature => feature.id)
    : modelData.selectedFeatures;

  return features.map(feature =>
    convertTestValue(
      modelData.featureNumberKey,
      feature,
      modelData.testData[stripSpaceAndSpecial(feature)]
    )
  );
}

// Convert a raw prediction to human readable (if needed).
function convertPrediction(modelData, model, rawPrediction) {
  const label = modelData.label ? modelData.label.id : model.labelColumn;

  return Object.keys(modelData.featureNumberKey).includes(label)
    ? getKeyByValue(modelData.featureNumberKey[label], rawPrediction)
    : parseFloat(rawPrediction);
}

export function predict(modelData) {
  // Determine which algorithm to use.
  if (KNNTrainers.includes(modelData.selectedTrainer)) {
    const model = KNN.load(modelData.trainedModel);
    const rawPrediction = model.predict(prepareTestValues(modelData));
    return convertPrediction(modelData, model, rawPrediction);
  }

  const TreeModel = treeTrainers[modelData.selectedTrainer];
  if (TreeModel) {
    let model;
    try {
      // Raises RangeError when the blob names the other tree kind.
      model = TreeModel.load(modelData.trainedModel);
    } catch {
      return PREDICTION_FAILED;
    }
    // ml-cart rejects a flat array, so pass one row as a matrix and unwrap.
    const [rawPrediction] = model.predict([prepareTestValues(modelData)]);
    return convertPrediction(modelData, model, rawPrediction);
  }

  return UNKNOWN_TRAINER;
}

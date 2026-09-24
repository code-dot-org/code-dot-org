import fs from 'fs';
import path from 'path';

import {ColumnTypes, TestDataLocations} from '../../src/constants';
import {parseCSV} from '../../src/csvReaderWrapper';
import {buildDisplayTree} from '../../src/helpers/displayTree';
import {getKeyByValue} from '../../src/helpers/utils';
import {convertValueForTraining} from '../../src/helpers/valueConversion';
import {
  addSelectedFeature,
  resetState,
  setColumnsByDataType,
  setImportedMetadata,
  setLabelColumn,
  setMode,
  setReserveLocation,
  setSelectedCSV,
  setSelectedJSON,
} from '../../src/redux';
import {getDisplayTree} from '../../src/selectors/visualizationSelectors';
import {store} from '../../src/store';
import train from '../../src/train';

const DIR = path.join(__dirname, '../../public/datasets');

function load(id, {label, features, mode = {trainer: 'decisionTree'}} = {}) {
  const csv = fs.readFileSync(path.join(DIR, `${id}.csv`), 'utf8');
  const metadata = JSON.parse(
    fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'),
  );

  store.dispatch(resetState());
  train.reset();
  store.dispatch(setMode(mode));
  store.dispatch(setSelectedCSV(`${id}.csv`));
  store.dispatch(setSelectedJSON(`${id}.json`));
  parseCSV(csv, false, false);
  store.dispatch(setImportedMetadata(metadata));
  metadata.fields.forEach(field =>
    store.dispatch(
      setColumnsByDataType(field.id, field.type || ColumnTypes.CATEGORICAL),
    ),
  );
  store.dispatch(setReserveLocation(TestDataLocations.END));
  const labelColumn = label || metadata.defaultLabelColumn;
  store.dispatch(setLabelColumn(labelColumn));
  (
    features ||
    Object.keys(store.getState().data[0]).filter(
      column => column !== labelColumn,
    )
  ).forEach(column => store.dispatch(addSelectedFeature(column)));

  train.init(store);
  train.onClickTrain();
  return store.getState();
}

function route(node, row) {
  while (node.type === 'question') {
    const [left, right] = node.branches;
    const value = row[node.column];
    const goesLeft =
      left.kind === 'values'
        ? left.values.includes(String(value))
        : parseFloat(value) < left.threshold;
    node = goesLeft ? left.child : right.child;
  }
  return node.prediction;
}

function modelPredictions(state) {
  const rows = state.data.map(row =>
    state.selectedFeatures.map(feature =>
      convertValueForTraining(state, row[feature], feature),
    ),
  );
  const labelKey = state.featureNumberKey[state.labelColumn];
  return state.trainedModel
    .predict(rows)
    .map(prediction =>
      labelKey ? getKeyByValue(labelKey, prediction) : prediction,
    );
}

function countQuestions(node) {
  return node.type === 'answer'
    ? 0
    : 1 + node.branches.reduce((sum, b) => sum + countQuestions(b.child), 0);
}

describe('getDisplayTree on shipped datasets', () => {
  test.each([
    ['zoo', {label: 'Class', features: ['Legs', 'Feathers', 'Milk', 'Fins']}],
    ['car_evaluation', {}],
    ['insurance_cost', {}],
    ['jeans', {}],
  ])('every row of %s reaches the answer the model predicts', (id, options) => {
    const state = load(id, options);
    const tree = getDisplayTree(state);

    expect(tree).toBeDefined();
    expect(countQuestions(tree)).toBeGreaterThan(0);
    expect(state.data.map(row => route(tree, row))).toEqual(
      modelPredictions(state),
    );
  });

  test('a KNN model has no display tree', () => {
    const state = load('zoo', {label: 'Class', mode: {}});

    expect(state.trainedModel).toBeDefined();
    expect(getDisplayTree(state)).toBeUndefined();
  });
});

// Hand-built trees cover cases ml-cart produces only by chance.
describe('buildDisplayTree', () => {
  const legsContext = {
    features: ['Legs'],
    featureNumberKey: {
      Legs: {4: 0, 0: 1, 2: 2, 6: 3},
      Class: {Mammal: 0, Fish: 1, Bird: 2, Bug: 3},
    },
    labelColumn: 'Class',
  };
  const leaf = classCode => {
    const distribution = new Array(classCode + 1).fill(0);
    distribution[classCode] = 1;
    return {distribution: [distribution]};
  };

  test('a model that is not a tree has no display tree', () => {
    expect(
      buildDisplayTree({name: 'KNN', root: {}}, legsContext),
    ).toBeUndefined();
  });

  test('a second split on a column names only the values left there', () => {
    const tree = buildDisplayTree(
      {
        name: 'DTClassifier',
        root: {
          splitColumn: 0,
          splitValue: 0.5,
          left: leaf(0),
          right: {
            splitColumn: 0,
            splitValue: 1.5,
            left: leaf(1),
            right: leaf(2),
          },
        },
      },
      legsContext,
    );

    expect(tree.branches.map(b => b.values)).toEqual([['4'], ['0', '2', '6']]);
    expect(tree.branches[1].child.branches.map(b => b.values)).toEqual([
      ['0'],
      ['2', '6'],
    ]);
    expect(tree.branches[1].child.branches[1].child).toEqual({
      type: 'answer',
      prediction: 'Bird',
    });
  });

  test('a leaf that keeps split fields is an answer', () => {
    const tree = buildDisplayTree(
      {
        name: 'DTClassifier',
        root: {splitColumn: 0, splitValue: 0.5, ...leaf(3)},
      },
      legsContext,
    );

    expect(tree).toEqual({type: 'answer', prediction: 'Bug'});
  });

  test('a tie goes to the first class, as ml-cart predicts', () => {
    const tree = buildDisplayTree(
      {name: 'DTClassifier', root: {distribution: [[0, 0.5, 0.5]]}},
      legsContext,
    );

    expect(tree.prediction).toBe('Fish');
  });

  test('a leaf with no distribution throws, as ml-cart does', () => {
    expect(() =>
      buildDisplayTree({name: 'DTClassifier', root: {}}, legsContext),
    ).toThrow();
  });

  test('a numerical feature splits at a threshold', () => {
    const tree = buildDisplayTree(
      {
        name: 'DTRegression',
        root: {
          splitColumn: 0,
          splitValue: 52.5,
          left: {distribution: 10},
          right: {distribution: 90},
        },
      },
      {features: ['size'], featureNumberKey: {}, labelColumn: 'price'},
    );

    expect(tree.branches).toEqual([
      {
        kind: 'lessThan',
        threshold: 52.5,
        child: {type: 'answer', prediction: 10},
      },
      {
        kind: 'atLeast',
        threshold: 52.5,
        child: {type: 'answer', prediction: 90},
      },
    ]);
  });
});

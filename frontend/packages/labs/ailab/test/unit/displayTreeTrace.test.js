import {buildDisplayTree, getChildNodeId} from '../../src/helpers/displayTree';
import {layoutDisplayTree} from '../../src/helpers/displayTreeLayout';
import {traceDisplayTree} from '../../src/helpers/displayTreeTrace';
import {getConvertedPredictedLabel} from '../../src/helpers/valueConversion';
import {setTestData} from '../../src/redux';
import {
  getDisplayTree,
  getPredictionTrace,
} from '../../src/selectors/visualizationSelectors';
import {store} from '../../src/store';
import train from '../../src/train';

import {rowTraces, trainDataset} from './trainedDataset';

const zooOptions = {
  label: 'Class',
  features: ['Legs', 'Feathers', 'Milk', 'Fins'],
};

describe('traceDisplayTree on a shipped dataset', () => {
  test('each step names the column, the row value and the branch taken', () => {
    const state = trainDataset('zoo', zooOptions);

    rowTraces(state).forEach(({path, steps}, rowIndex) => {
      const row = state.data[rowIndex];

      expect(steps.length).toBeGreaterThan(0);
      expect(path).toHaveLength(steps.length + 1);
      steps.forEach((step, index) => {
        expect(state.selectedFeatures).toContain(step.column);
        expect(step.value).toBe(row[step.column]);
        expect(step.nodeId).toBe(path[index]);
        expect(path[index + 1]).toBe(
          getChildNodeId(step.nodeId, step.branchIndex),
        );
      });
    });
  });

  test('the path names the placed nodes of the layout', () => {
    const state = trainDataset('zoo', zooOptions);
    const placedById = Object.fromEntries(
      layoutDisplayTree(getDisplayTree(state)).nodes.map(placed => [
        placed.id,
        placed,
      ]),
    );

    rowTraces(state).forEach(({path, prediction}) => {
      const placedNodes = path.map(id => placedById[id]);

      expect(placedNodes.every(Boolean)).toBe(true);
      expect(placedNodes[placedNodes.length - 1].node).toEqual({
        type: 'answer',
        prediction,
      });
    });
  });
});

describe('traceDisplayTree', () => {
  const leaf = classCode => {
    const distribution = new Array(classCode + 1).fill(0);
    distribution[classCode] = 1;
    return {distribution: [distribution]};
  };
  const legsModel = {
    name: 'DTClassifier',
    root: {
      splitColumn: 0,
      splitValue: 0.5,
      left: leaf(0),
      right: {splitColumn: 0, splitValue: 1.5, left: leaf(1), right: leaf(2)},
    },
  };
  const legs = buildDisplayTree(legsModel, {
    features: ['Legs'],
    featureNumberKey: {
      Legs: {4: 0, 0: 1, 2: 2, 6: 3},
      Class: {Mammal: 0, Fish: 1, Bird: 2},
    },
    labelColumn: 'Class',
  });
  const sizeModel = {
    name: 'DTRegression',
    root: {
      splitColumn: 0,
      splitValue: 52.5,
      left: {distribution: 10},
      right: {distribution: 90},
    },
  };
  const size = buildDisplayTree(sizeModel, {
    features: ['size'],
    featureNumberKey: {},
    labelColumn: 'price',
  });

  test('follows the splits of the model', () => {
    expect(traceDisplayTree(legs, legsModel.root, [3], {Legs: '6'})).toEqual({
      path: ['0', '0.1', '0.1.1'],
      steps: [
        {
          nodeId: '0',
          column: 'Legs',
          value: '6',
          branchIndex: 1,
          branch: legs.branches[1],
        },
        {
          nodeId: '0.1',
          column: 'Legs',
          value: '6',
          branchIndex: 1,
          branch: legs.branches[1].child.branches[1],
        },
      ],
      prediction: 'Bird',
    });
  });

  test('the model inputs choose each branch, not the row', () => {
    expect(
      traceDisplayTree(legs, legsModel.root, [0], {Legs: '6'}),
    ).toMatchObject({path: ['0', '0.0'], prediction: 'Mammal'});
  });

  test('an input at the split value goes down the second branch', () => {
    expect(
      traceDisplayTree(size, sizeModel.root, [52.4], {size: '52.4'}),
    ).toMatchObject({path: ['0', '0.0'], prediction: 10});
    expect(
      traceDisplayTree(size, sizeModel.root, [52.5], {size: '52.5'}),
    ).toMatchObject({path: ['0', '0.1'], prediction: 90});
  });

  test('an input with no number goes down the second branch, as ml-cart does', () => {
    expect(
      traceDisplayTree(legs, legsModel.root, [undefined], {Legs: '7'}).path,
    ).toEqual(['0', '0.1', '0.1.1']);
    expect(
      traceDisplayTree(size, sizeModel.root, [NaN], {size: ''}).path,
    ).toEqual(['0', '0.1']);
  });

  test('a tree with no question is one answer', () => {
    const model = {name: 'DTClassifier', root: leaf(0)};
    const answer = buildDisplayTree(model, {
      features: ['Legs'],
      featureNumberKey: {Class: {Mammal: 0}},
      labelColumn: 'Class',
    });

    expect(traceDisplayTree(answer, model.root, [2], {Legs: '2'})).toEqual({
      path: ['0'],
      steps: [],
      prediction: 'Mammal',
    });
  });
});

describe('getPredictionTrace', () => {
  const fish = {Legs: '0', Feathers: 'No', Milk: 'No', Fins: 'Yes'};
  const mammal = {Legs: '4', Feathers: 'No', Milk: 'Yes', Fins: 'No'};
  const predictWith = values => {
    Object.entries(values).forEach(([feature, value]) =>
      store.dispatch(setTestData(feature, value)),
    );
    train.onClickPredict(store);
    return store.getState();
  };

  test('is the trace of the values the student predicted with', () => {
    const state = trainDataset('zoo', zooOptions);
    const row = state.data[0];
    expect(getPredictionTrace(state)).toBeUndefined();

    const predicted = predictWith(
      Object.fromEntries(
        zooOptions.features.map(feature => [feature, String(row[feature])]),
      ),
    );

    expect(getPredictionTrace(predicted)).toEqual(rowTraces(state)[0]);
  });

  test('clears when a value changes, until the next prediction', () => {
    trainDataset('zoo', zooOptions);
    predictWith(fish);
    expect(getPredictionTrace(store.getState())).toBeDefined();

    store.dispatch(setTestData('Legs', '4'));
    expect(getPredictionTrace(store.getState())).toBeUndefined();

    train.onClickPredict(store);
    const state = store.getState();
    expect(getPredictionTrace(state).prediction).toBe(
      getConvertedPredictedLabel(state),
    );
  });

  test('keeps the values predicted with when the test data changes', () => {
    trainDataset('zoo', zooOptions);
    const predicted = predictWith(fish);
    const trace = getPredictionTrace(predicted);

    expect(getPredictionTrace({...predicted, testData: mammal})).toEqual(trace);
  });

  test('a KNN model has no trace', () => {
    trainDataset('zoo', {...zooOptions, mode: {}});
    const state = predictWith(fish);

    expect(state.prediction).toBeDefined();
    expect(getPredictionTrace(state)).toBeUndefined();
  });
});

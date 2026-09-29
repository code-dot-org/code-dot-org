import {getChildNodeId} from '../../src/helpers/displayTree';
import {layoutDisplayTree} from '../../src/helpers/displayTreeLayout';
import {traceDisplayTree} from '../../src/helpers/displayTreeTrace';
import {setTestData} from '../../src/redux';
import {
  getDisplayTree,
  getPredictionTrace,
} from '../../src/selectors/visualizationSelectors';
import {store} from '../../src/store';
import train from '../../src/train';

import {modelPredictions, trainDataset} from './trainedDataset';

describe('traceDisplayTree on shipped datasets', () => {
  test.each([
    ['zoo', {label: 'Class', features: ['Legs', 'Feathers', 'Milk', 'Fins']}],
    ['insurance_cost', {}],
    ['jeans', {}],
  ])(
    'every row of %s traces to the answer the model predicts',
    (id, options) => {
      const state = trainDataset(id, options);
      const tree = getDisplayTree(state);
      const traces = state.data.map(row => traceDisplayTree(tree, row));

      expect(traces.map(trace => trace.prediction)).toEqual(
        modelPredictions(state),
      );
    },
  );

  test('each step names the column, the row value and the branch taken', () => {
    const state = trainDataset('zoo', {
      label: 'Class',
      features: ['Legs', 'Feathers', 'Milk', 'Fins'],
    });
    const tree = getDisplayTree(state);

    state.data.forEach(row => {
      const {path, steps} = traceDisplayTree(tree, row);

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
    const state = trainDataset('zoo', {
      label: 'Class',
      features: ['Legs', 'Feathers', 'Milk', 'Fins'],
    });
    const tree = getDisplayTree(state);
    const placedById = Object.fromEntries(
      layoutDisplayTree(tree).nodes.map(placed => [placed.id, placed]),
    );

    state.data.forEach(row => {
      const {path, prediction} = traceDisplayTree(tree, row);
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
  const mammal = {type: 'answer', prediction: 'Mammal'};
  const fish = {type: 'answer', prediction: 'Fish'};
  const bird = {type: 'answer', prediction: 'Bird'};
  const legsAgain = {
    type: 'question',
    column: 'Legs',
    branches: [
      {kind: 'values', values: ['0'], child: fish},
      {kind: 'values', values: ['2', '6'], child: bird},
    ],
  };
  const legs = {
    type: 'question',
    column: 'Legs',
    branches: [
      {kind: 'values', values: ['4'], child: mammal},
      {kind: 'values', values: ['0', '2', '6'], child: legsAgain},
    ],
  };
  const size = {
    type: 'question',
    column: 'size',
    branches: [
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
    ],
  };

  test('follows the values of a categorical column', () => {
    expect(traceDisplayTree(legs, {Legs: '6'})).toEqual({
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
          branch: legsAgain.branches[1],
        },
      ],
      prediction: 'Bird',
    });
  });

  test('a number in the row matches a categorical value', () => {
    expect(traceDisplayTree(legs, {Legs: 4}).prediction).toBe('Mammal');
  });

  test('a numerical column compares the value with the threshold', () => {
    expect(traceDisplayTree(size, {size: '52.4'})).toMatchObject({
      path: ['0', '0.0'],
      prediction: 10,
    });
    expect(traceDisplayTree(size, {size: 52.5})).toMatchObject({
      path: ['0', '0.1'],
      prediction: 90,
    });
  });

  test('a value that no branch names goes down the second branch, as ml-cart does', () => {
    expect(traceDisplayTree(legs, {Legs: '7'}).path).toEqual([
      '0',
      '0.1',
      '0.1.1',
    ]);
    expect(traceDisplayTree(legs, {}).path).toEqual(['0', '0.1', '0.1.1']);
    expect(traceDisplayTree(size, {size: ''}).path).toEqual(['0', '0.1']);
  });

  test('a tree with no question is one answer', () => {
    expect(traceDisplayTree(mammal, {Legs: '2'})).toEqual({
      path: ['0'],
      steps: [],
      prediction: 'Mammal',
    });
  });
});

describe('getPredictionTrace', () => {
  const options = {
    label: 'Class',
    features: ['Legs', 'Feathers', 'Milk', 'Fins'],
  };
  const predictWith = values => {
    Object.entries(values).forEach(([feature, value]) =>
      store.dispatch(setTestData(feature, value)),
    );
    train.onClickPredict(store);
    return store.getState();
  };

  test('is the trace of the values the student predicted with', () => {
    const state = trainDataset('zoo', options);
    const row = state.data[0];
    expect(getPredictionTrace(state)).toBeUndefined();

    const predicted = predictWith(
      Object.fromEntries(
        options.features.map(feature => [feature, String(row[feature])]),
      ),
    );

    const trace = getPredictionTrace(predicted);
    expect(trace).toEqual(traceDisplayTree(getDisplayTree(state), row));
    expect(trace.prediction).toBe(modelPredictions(state)[0]);
  });

  test('clears when a value changes, until the next prediction', () => {
    const state = trainDataset('zoo', options);
    const fish = {Legs: '0', Feathers: 'No', Milk: 'No', Fins: 'Yes'};
    predictWith(fish);
    expect(getPredictionTrace(store.getState())).toBeDefined();

    store.dispatch(setTestData('Legs', '4'));
    expect(getPredictionTrace(store.getState())).toBeUndefined();

    train.onClickPredict(store);
    expect(getPredictionTrace(store.getState())).toEqual(
      traceDisplayTree(getDisplayTree(state), {...fish, Legs: '4'}),
    );
  });

  test('a KNN model has no trace', () => {
    trainDataset('zoo', {...options, mode: {}});
    const state = predictWith({
      Legs: '0',
      Feathers: 'No',
      Milk: 'No',
      Fins: 'Yes',
    });

    expect(state.prediction).toBeDefined();
    expect(getPredictionTrace(state)).toBeUndefined();
  });
});

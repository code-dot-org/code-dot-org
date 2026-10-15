import {TestDataLocations} from '../../src/constants';
import {buildDisplayTree, getChildNodeId} from '../../src/helpers/displayTree';
import {layoutDisplayTree} from '../../src/helpers/displayTreeLayout';
import {
  countDisplayTreeRows,
  groupDisplayTreeRows,
  traceDisplayTree,
} from '../../src/helpers/displayTreeTrace';
import {getConvertedPredictedLabel} from '../../src/helpers/valueConversion';
import {playPredictionStep, setTestData} from '../../src/redux';
import {
  getDisplayTree,
  getDisplayTreeCounts,
  getDisplayTreeRows,
  getPredictionStep,
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
    const {state, project, trainedModel} = trainDataset('zoo', zooOptions);

    rowTraces(state, project, trainedModel).forEach(
      ({path, steps}, rowIndex) => {
        const row = state.data[rowIndex];

        expect(steps.length).toBeGreaterThan(0);
        expect(path).toHaveLength(steps.length + 1);
        steps.forEach((step, index) => {
          expect(project.selectedFeatures).toContain(step.column);
          expect(step.value).toBe(row[step.column]);
          expect(step.nodeId).toBe(path[index]);
          expect(path[index + 1]).toBe(
            getChildNodeId(step.nodeId, step.branchIndex),
          );
        });
      },
    );
  });

  test('the path names the placed nodes of the layout', () => {
    const {state, project, trainedModel} = trainDataset('zoo', zooOptions);
    const placedById = Object.fromEntries(
      layoutDisplayTree(getDisplayTree(state, project, trainedModel)).nodes.map(
        placed => [placed.id, placed],
      ),
    );

    rowTraces(state, project, trainedModel).forEach(({path, prediction}) => {
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

describe('countDisplayTreeRows', () => {
  const leaf = {distribution: [[1]]};
  const model = {
    splitColumn: 0,
    splitValue: 0.5,
    left: leaf,
    right: {splitColumn: 0, splitValue: 1.5, left: leaf, right: leaf},
  };
  const tree = buildDisplayTree(
    {name: 'DTClassifier', root: model},
    {features: ['x'], featureNumberKey: {}, labelColumn: 'y'},
  );

  test('groups each row at every node on its path', () => {
    const groups = groupDisplayTreeRows(tree, model, [[0], [1], [2], [3]]);

    expect(Object.fromEntries(groups)).toEqual({
      0: [0, 1, 2, 3],
      '0.0': [0],
      0.1: [1, 2, 3],
      '0.1.0': [1],
      '0.1.1': [2, 3],
    });
  });

  test('counts each row at every node on its path, by its grade', () => {
    const counts = countDisplayTreeRows(
      tree,
      model,
      [[0], [1], [2], [3]],
      ['correct', 'incorrect', 'correct', 'correct'],
    );

    expect(Object.fromEntries(counts)).toEqual({
      0: {correct: 3, incorrect: 1},
      '0.0': {correct: 1, incorrect: 0},
      0.1: {correct: 2, incorrect: 1},
      '0.1.0': {correct: 0, incorrect: 1},
      '0.1.1': {correct: 2, incorrect: 0},
    });
  });
});

describe('getDisplayTreeRows', () => {
  const nodeIds = (state, project, trainedModel) =>
    layoutDisplayTree(getDisplayTree(state, project, trainedModel)).nodes.map(
      placed => placed.id,
    );

  test.each([TestDataLocations.END, TestDataLocations.RANDOM])(
    'lists the dataset rows whose path reaches each node, reserving at %s',
    reserveLocation => {
      const {state, project, trainedModel} = trainDataset('zoo', {
        ...zooOptions,
        reserveLocation,
      });
      const rows = getDisplayTreeRows(state, project, trainedModel);
      const traces = rowTraces(state, project, trainedModel);
      const reserved = new Set(project.accuracyCheckRowIndices);

      nodeIds(state, project, trainedModel).forEach(nodeId => {
        const reaching = traces
          .map((trace, row) => (trace.path.includes(nodeId) ? row : undefined))
          .filter(row => row !== undefined);

        const {correct, incorrect, trained} = rows(nodeId);

        expect([...correct, ...incorrect].sort((a, b) => a - b)).toEqual(
          reaching.filter(row => reserved.has(row)),
        );
        expect(trained).toEqual(reaching.filter(row => !reserved.has(row)));
      });
    },
  );

  test('grades the accuracy check rows at each node as the node counts them', () => {
    const {state, project, trainedModel} = trainDataset('zoo', zooOptions);
    const rows = getDisplayTreeRows(state, project, trainedModel);
    const counts = getDisplayTreeCounts(state, project, trainedModel);

    nodeIds(state, project, trainedModel).forEach(nodeId => {
      const {correct, incorrect} = rows(nodeId);
      expect({
        correct: correct.length,
        incorrect: incorrect.length,
      }).toEqual(counts(nodeId));
    });
  });

  test('a KNN model has no rows at any node', () => {
    const {state, project, trainedModel} = trainDataset('zoo', {
      ...zooOptions,
      mode: {},
    });

    expect(getDisplayTreeRows(state, project, trainedModel)('0')).toEqual({
      correct: [],
      incorrect: [],
      trained: [],
    });
  });
});

describe('getPredictionTrace', () => {
  const fish = {Legs: '0', Feathers: 'No', Milk: 'No', Fins: 'Yes'};
  const mammal = {Legs: '4', Feathers: 'No', Milk: 'Yes', Fins: 'No'};
  const predictWith = (values, project, trainedModel) => {
    Object.entries(values).forEach(([feature, value]) =>
      store.dispatch(setTestData(feature, value)),
    );
    train.onClickPredict(trainedModel, project);
    return store.getState();
  };

  test('is the trace of the values the student predicted with', () => {
    const {state, project, trainedModel} = trainDataset('zoo', zooOptions);
    const row = state.data[0];
    expect(getPredictionTrace(state, project, trainedModel)).toBeUndefined();

    const predicted = predictWith(
      Object.fromEntries(
        zooOptions.features.map(feature => [feature, String(row[feature])]),
      ),
      project,
      trainedModel,
    );

    expect(getPredictionTrace(predicted, project, trainedModel)).toEqual(
      rowTraces(state, project, trainedModel)[0],
    );
  });

  test('clears when a value changes, until the next prediction', () => {
    const {project, trainedModel} = trainDataset('zoo', zooOptions);
    predictWith(fish, project, trainedModel);
    expect(
      getPredictionTrace(store.getState(), project, trainedModel),
    ).toBeDefined();

    store.dispatch(setTestData('Legs', '4'));
    expect(
      getPredictionTrace(store.getState(), project, trainedModel),
    ).toBeUndefined();

    train.onClickPredict(trainedModel, project);
    const state = store.getState();
    expect(getPredictionTrace(state, project, trainedModel).prediction).toBe(
      getConvertedPredictedLabel(state, project),
    );
  });

  test('keeps the values predicted with when the test data changes', () => {
    const {project, trainedModel} = trainDataset('zoo', zooOptions);
    const predicted = predictWith(fish, project, trainedModel);
    const trace = getPredictionTrace(predicted, project, trainedModel);

    expect(
      getPredictionTrace(
        {...predicted, testData: mammal},
        project,
        trainedModel,
      ),
    ).toEqual(trace);
  });

  test('a KNN model has no trace', () => {
    const {project, trainedModel} = trainDataset('zoo', {
      ...zooOptions,
      mode: {},
    });
    const state = predictWith(fish, project, trainedModel);

    expect(state.prediction).toBeDefined();
    expect(getPredictionTrace(state, project, trainedModel)).toBeUndefined();
  });
});

describe('getPredictionStep', () => {
  test('is the last step of the path until a step is chosen', () => {
    const {project, trainedModel} = trainDataset('zoo', zooOptions);
    const fish = {Legs: '0', Feathers: 'No', Milk: 'No', Fins: 'Yes'};
    Object.entries(fish).forEach(([feature, value]) =>
      store.dispatch(setTestData(feature, value)),
    );
    train.onClickPredict(trainedModel, project);
    const {path} = getPredictionTrace(store.getState(), project, trainedModel);

    expect(getPredictionStep(store.getState(), project, trainedModel)).toBe(
      path.length - 1,
    );

    store.dispatch(playPredictionStep(0));

    expect(getPredictionStep(store.getState(), project, trainedModel)).toBe(0);
  });
});

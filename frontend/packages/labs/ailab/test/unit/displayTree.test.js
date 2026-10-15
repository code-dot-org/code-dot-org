import {
  buildDisplayTree,
  getChildNodeId,
  thresholdText,
} from '../../src/helpers/displayTree';
import {getDisplayTree} from '../../src/selectors/visualizationSelectors';

import {modelPredictions, rowTraces, trainDataset} from './trainedDataset';

function routeByLabels(node, row) {
  const path = ['0'];
  while (node.type === 'question') {
    const [left, right] = node.branches;
    const value = row[node.column];
    const goesLeft =
      left.kind === 'values'
        ? left.values.includes(String(value))
        : parseFloat(value) < left.threshold;
    path.push(getChildNodeId(path[path.length - 1], goesLeft ? 0 : 1));
    node = goesLeft ? left.child : right.child;
  }
  return path;
}

function countQuestions(node) {
  return node.type === 'answer'
    ? 0
    : 1 + node.branches.reduce((sum, b) => sum + countQuestions(b.child), 0);
}

describe('getDisplayTree on shipped datasets', () => {
  test.each([
    ['zoo', {label: 'Class', features: ['Legs', 'Feathers', 'Milk', 'Fins']}],
    ['insurance_cost', {}],
    ['jeans', {}],
  ])(
    'every row of %s follows the labels down the model route to its answer',
    (id, options) => {
      const {state, project, trainedModel} = trainDataset(id, options);
      const tree = getDisplayTree(state, project, trainedModel);
      const traces = rowTraces(state, project, trainedModel);

      expect(tree).toBeDefined();
      expect(countQuestions(tree)).toBeGreaterThan(0);
      expect(state.data.map(row => routeByLabels(tree, row))).toEqual(
        traces.map(trace => trace.path)
      );
      expect(traces.map(trace => trace.prediction)).toEqual(
        modelPredictions(state, project, trainedModel)
      );
    }
  );

  test('a KNN model has no display tree', () => {
    const {state, project, trainedModel} = trainDataset('zoo', {
      label: 'Class',
      mode: {},
    });

    expect(trainedModel).toBeDefined();
    expect(getDisplayTree(state, project, trainedModel)).toBeUndefined();
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
      buildDisplayTree({name: 'KNN', root: {}}, legsContext)
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
      legsContext
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
      legsContext
    );

    expect(tree).toEqual({type: 'answer', prediction: 'Bug'});
  });

  test('a tie goes to the first class, as ml-cart predicts', () => {
    const tree = buildDisplayTree(
      {name: 'DTClassifier', root: {distribution: [[0, 0.5, 0.5]]}},
      legsContext
    );

    expect(tree.prediction).toBe('Fish');
  });

  test('a leaf with no distribution throws, as ml-cart does', () => {
    expect(() =>
      buildDisplayTree({name: 'DTClassifier', root: {}}, legsContext)
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
      {features: ['size'], featureNumberKey: {}, labelColumn: 'price'}
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

describe('thresholdText', () => {
  test('drops float noise from a split midpoint', () => {
    expect(
      thresholdText({kind: 'lessThan', threshold: (39.1 + 39.2) / 2})
    ).toBe('< 39.15');
    expect(thresholdText({kind: 'atLeast', threshold: (3.3 + 3.4) / 2})).toBe(
      '≥ 3.35'
    );
  });

  test('keeps a split finer than two decimal places', () => {
    expect(thresholdText({kind: 'atLeast', threshold: 0.005})).toBe('≥ 0.005');
  });
});

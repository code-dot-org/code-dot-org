import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';

import {
  buildTreeView,
  getTreeDepth,
  countLeaves,
} from '../../src/helpers/treeStructure';

const options = {
  features: ['sun', 'shape'],
  featureNumberKey: {
    grew: {no: 0, yes: 1},
    shape: {round: 0, flat: 1},
  },
  labelColumn: 'grew',
};

const leaf = distribution => ({distribution});

describe('buildTreeView', () => {
  test('a numerical split reads as a threshold', () => {
    const view = buildTreeView(
      {root: {splitColumn: 0, splitValue: 2.5, left: leaf(0), right: leaf(0)}},
      options,
    );

    expect(view.condition).toBe('sun < 2.5');
  });

  test('a categorical split reads through the feature number key', () => {
    const view = buildTreeView(
      {root: {splitColumn: 1, splitValue: 0.5, left: leaf(0), right: leaf(0)}},
      options,
    );

    expect(view.condition).toBe('shape is round');
  });

  test('a categorical split naming several options joins them', () => {
    const view = buildTreeView(
      {root: {splitColumn: 1, splitValue: 1.5, left: leaf(0), right: leaf(0)}},
      {
        ...options,
        featureNumberKey: {
          ...options.featureNumberKey,
          shape: {round: 0, flat: 1, curled: 2},
        },
      },
    );

    expect(view.condition).toBe('shape is round or flat');
  });

  test('a categorical split over many options gives a count', () => {
    const manyOptions = {a: 0, b: 1, c: 2, d: 3, e: 4};
    const view = buildTreeView(
      {root: {splitColumn: 1, splitValue: 3.5, left: leaf(0), right: leaf(0)}},
      {...options, featureNumberKey: {shape: manyOptions}},
    );

    expect(view.condition).toBe('shape is one of 4 options');
  });

  test('a node keeping splitValue without children is a leaf', () => {
    // ml-cart leaves splitValue and splitColumn on a node that stopped.
    const view = buildTreeView(
      {root: {splitColumn: 0, splitValue: 73, distribution: [[0, 1]]}},
      options,
    );

    expect(view).toEqual({kind: 'leaf', prediction: 'yes'});
  });
});

describe('leaf predictions', () => {
  // The row is truncated at the highest class present, so its length is not
  // the class count.
  test.each([
    [[[1]], 'no'],
    [[[0, 1]], 'yes'],
    [[[0.25, 0.75]], 'yes'],
    [[[0.5, 0.5]], 'no'],
  ])('classifier distribution %j predicts %s', (distribution, expected) => {
    const view = buildTreeView({root: leaf(distribution)}, options);
    expect(view.prediction).toBe(expected);
  });

  test('a live Matrix distribution reads the same as a plain array', () => {
    const matrix = {getRow: () => [0, 1]};
    const view = buildTreeView({root: leaf(matrix)}, options);
    expect(view.prediction).toBe('yes');
  });

  test('a regression leaf is its mean, rounded', () => {
    const view = buildTreeView({root: leaf(41.666666)}, options);
    expect(view.prediction).toBe('41.67');
  });

  test('an unmapped class index falls back to the number', () => {
    const view = buildTreeView({root: leaf([[0, 0, 1]])}, options);
    expect(view.prediction).toBe('2');
  });
});

describe('shape of a real model', () => {
  const trainingExamples = [
    [1, 0],
    [2, 0],
    [3, 1],
    [8, 1],
    [9, 0],
    [9, 1],
    [2, 1],
  ];
  const trainingLabels = [0, 0, 1, 1, 1, 0, 1];

  test('a trained classifier translates and agrees with predict', () => {
    const model = new DecisionTreeClassifier({maxDepth: 3, minNumSamples: 1});
    model.train(trainingExamples, trainingLabels);

    const view = buildTreeView(model.toJSON(), options);

    const depth = getTreeDepth(view);
    expect(depth).toBeGreaterThan(0);
    expect(depth).toBeLessThanOrEqual(3);
    expect(countLeaves(view)).toBeLessThanOrEqual(2 ** depth);

    // Walk the view the way ml-cart walks the model, and compare.
    const followView = row => {
      let node = view;
      let raw = model.toJSON().root;
      while (node.kind === 'split') {
        const goLeft = row[raw.splitColumn] < raw.splitValue;
        node = goLeft ? node.whenTrue : node.whenFalse;
        raw = goLeft ? raw.left : raw.right;
      }
      return node.prediction;
    };

    trainingExamples.forEach(row => {
      const predicted = model.predict([row])[0];
      const expected = predicted === 0 ? 'no' : 'yes';
      expect(followView(row)).toBe(expected);
    });
  });

  test('a trained regression tree translates to numeric leaves', () => {
    const model = new DecisionTreeRegression({maxDepth: 2, minNumSamples: 1});
    model.train(trainingExamples, [2, 3, 20, 22, 40, 41, 4]);

    const view = buildTreeView(model.toJSON(), {
      ...options,
      labelColumn: 'height',
    });

    const leaves = [];
    const collect = node =>
      node.kind === 'leaf'
        ? leaves.push(node.prediction)
        : [node.whenTrue, node.whenFalse].forEach(collect);
    collect(view);

    expect(leaves.length).toBeGreaterThan(1);
    leaves.forEach(prediction => expect(Number.isNaN(Number(prediction))).toBe(false));
  });
});

describe('tree measurements', () => {
  test('depth and leaf count of a hand-built tree', () => {
    const view = buildTreeView(
      {
        root: {
          splitColumn: 0,
          splitValue: 2,
          left: leaf([[1]]),
          right: {
            splitColumn: 1,
            splitValue: 0.5,
            left: leaf([[0, 1]]),
            right: leaf([[1]]),
          },
        },
      },
      options,
    );

    expect(getTreeDepth(view)).toBe(2);
    expect(countLeaves(view)).toBe(3);
  });

  test('a single leaf has no depth', () => {
    const view = buildTreeView({root: leaf([[1]])}, options);

    expect(getTreeDepth(view)).toBe(0);
    expect(countLeaves(view)).toBe(1);
  });
});

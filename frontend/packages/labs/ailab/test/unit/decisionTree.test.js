import {
  getDecisionTreeBranchKey,
  getDecisionTreeFeatureContributions,
  getDecisionTreeLeafAccuracyStats,
  getDecisionTreeRoot,
  getDecisionTreeTraceStage,
  traceDecisionTree,
} from '../../src/helpers/decisionTree';
import {ResultsGrades} from '../../src/constants';

describe('decisionTree helpers', () => {
  test('extracts a decision tree root from a trained model', () => {
    const root = {
      type: 'leaf',
      prediction: 'yes',
    };

    expect(
      getDecisionTreeRoot({
        predict: () => ['yes'],
        toJSON: () => ({algorithm: 'id3', root}),
      }),
    ).toBe(root);
  });

  test('traces categorical branches to a prediction leaf', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'categorical',
      defaultLabel: 'maybe',
      children: {
        0: {type: 'leaf', prediction: 'no'},
        1: {type: 'leaf', prediction: 'yes'},
      },
    };

    const trace = traceDecisionTree(root, [1]);

    expect(trace.prediction).toBe('yes');
    expect(trace.leafPathKey).toBe('root.children.1');
    expect(trace.steps[0]).toMatchObject({
      pathKey: 'root',
      branchValue: '1',
      childPathKey: 'root.children.1',
      branchKey: getDecisionTreeBranchKey('root', 'root.children.1'),
      usedDefault: false,
    });
  });

  test('uses the default prediction for an unknown categorical branch', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'categorical',
      defaultLabel: 'maybe',
      children: {
        0: {type: 'leaf', prediction: 'no'},
      },
    };

    const trace = traceDecisionTree(root, [1]);

    expect(trace.prediction).toBe('maybe');
    expect(trace.usedDefault).toBe(true);
    expect(trace.steps[0]).toMatchObject({
      branchDirection: 'default',
      usedDefault: true,
    });
  });

  test('traces numerical threshold branches to a prediction leaf', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'numerical',
      threshold: 50,
      defaultLabel: 10,
      left: {type: 'leaf', prediction: 10},
      right: {type: 'leaf', prediction: 20},
    };

    const trace = traceDecisionTree(root, [75]);

    expect(trace.prediction).toBe(20);
    expect(trace.leafPathKey).toBe('root.right');
    expect(trace.steps[0]).toMatchObject({
      branchDirection: 'right',
      childPathKey: 'root.right',
    });
  });

  test('returns the active decision node and branch for a trace stage', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'numerical',
      threshold: 50,
      defaultLabel: 10,
      left: {type: 'leaf', prediction: 10},
      right: {type: 'leaf', prediction: 20},
    };
    const trace = traceDecisionTree(root, [75]);

    expect(getDecisionTreeTraceStage(trace, 0)).toEqual({
      activePathKeys: ['root'],
      activeBranchKeys: [getDecisionTreeBranchKey('root', 'root.right')],
      emphasizedPathKeys: ['root'],
      emphasizedBranchKeys: [getDecisionTreeBranchKey('root', 'root.right')],
      activeTraceIndex: 0,
    });
  });

  test('keeps previous traversal highlighted and emphasizes the current step', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'categorical',
      defaultLabel: 'maybe',
      children: {
        0: {
          type: 'decision',
          featureIndex: 1,
          splitType: 'categorical',
          defaultLabel: 'no',
          children: {
            0: {type: 'leaf', prediction: 'no'},
            1: {type: 'leaf', prediction: 'yes'},
          },
        },
      },
    };
    const trace = traceDecisionTree(root, [0, 1]);

    expect(getDecisionTreeTraceStage(trace, 1)).toEqual({
      activePathKeys: ['root', 'root.children.0'],
      activeBranchKeys: [
        getDecisionTreeBranchKey('root', 'root.children.0'),
        getDecisionTreeBranchKey(
          'root.children.0',
          'root.children.0.children.1',
        ),
      ],
      emphasizedPathKeys: ['root.children.0'],
      emphasizedBranchKeys: [
        getDecisionTreeBranchKey(
          'root.children.0',
          'root.children.0.children.1',
        ),
      ],
      activeTraceIndex: 1,
    });
  });

  test('returns the active prediction leaf for the final trace stage', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'numerical',
      threshold: 50,
      defaultLabel: 10,
      left: {type: 'leaf', prediction: 10},
      right: {type: 'leaf', prediction: 20},
    };
    const trace = traceDecisionTree(root, [75]);

    expect(getDecisionTreeTraceStage(trace, 1)).toEqual({
      activePathKeys: ['root', 'root.right'],
      activeBranchKeys: [getDecisionTreeBranchKey('root', 'root.right')],
      emphasizedPathKeys: ['root.right'],
      emphasizedBranchKeys: [],
      activeTraceIndex: 1,
    });
  });

  test('clamps trace stages to the valid range', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'numerical',
      threshold: 50,
      defaultLabel: 10,
      left: {type: 'leaf', prediction: 10},
      right: {type: 'leaf', prediction: 20},
    };
    const trace = traceDecisionTree(root, [75]);

    expect(getDecisionTreeTraceStage(trace, -1).activeTraceIndex).toBe(0);
    expect(getDecisionTreeTraceStage(trace, 99).activeTraceIndex).toBe(1);
  });

  test('groups accuracy-check correctness by reached leaf', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'numerical',
      threshold: 50,
      defaultLabel: 'no',
      left: {type: 'leaf', prediction: 'no'},
      right: {type: 'leaf', prediction: 'yes'},
    };

    const stats = getDecisionTreeLeafAccuracyStats(
      root,
      [[25], [75], [90]],
      [
        ResultsGrades.CORRECT,
        ResultsGrades.INCORRECT,
        ResultsGrades.CORRECT,
      ],
    );

    expect(stats).toEqual({
      'root.left': {correct: 1, total: 1},
      'root.right': {correct: 1, total: 2},
    });
  });

  test('does not add leaf accuracy stats for default predictions', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'categorical',
      defaultLabel: 'maybe',
      children: {
        0: {type: 'leaf', prediction: 'no'},
      },
    };

    const stats = getDecisionTreeLeafAccuracyStats(root, [[1]], [
      ResultsGrades.CORRECT,
    ]);

    expect(stats).toEqual({});
  });

  test('calculates feature contribution for the selected prediction path', () => {
    const root = {
      type: 'decision',
      featureIndex: 0,
      splitType: 'categorical',
      defaultLabel: 'yes',
      sampleCount: 4,
      labelCounts: {yes: 3, no: 1},
      impurityReduction: 0.31,
      children: {
        0: {
          type: 'leaf',
          prediction: 'no',
          sampleCount: 1,
          labelCounts: {no: 1},
        },
        1: {
          type: 'leaf',
          prediction: 'yes',
          sampleCount: 3,
          labelCounts: {yes: 3},
        },
      },
    };

    const trace = traceDecisionTree(root, [1]);
    const contributions = getDecisionTreeFeatureContributions(trace);

    expect(contributions.root).toEqual({
      beforeProbability: 0.75,
      afterProbability: 1,
      contribution: 0.25,
    });
  });
});

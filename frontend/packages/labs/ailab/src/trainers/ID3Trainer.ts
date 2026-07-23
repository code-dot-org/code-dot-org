import type {Store} from 'redux';

import {ColumnTypes} from '../constants';
import {getPercentCorrect} from '../helpers/accuracy';
import {logMetric} from '../helpers/metrics';
import type {RootState} from '../redux';
import {
  setAccuracyCheckPredictedLabels,
  setHistoricResult,
  setKValue,
  setPrediction,
  setTrainedModel,
} from '../redux';
import type {
  DecisionTreeModelData,
  DecisionTreeNode,
  PredictionModel,
  TrainedModelResult,
} from '../types';

type Label = number | string;

type SplitType = 'categorical' | 'numerical';

interface TrainingRow {
  example: number[];
  label: Label;
}

interface SplitCandidate {
  featureIndex: number;
  splitType: SplitType;
  gain: number;
  threshold?: number;
}

export class ID3Model implements PredictionModel {
  private root: DecisionTreeNode;
  private readonly featureTypes: string[];

  constructor(
    examples: number[][],
    labels: Label[],
    featureTypes: string[],
  ) {
    this.featureTypes = featureTypes;
    const rows = examples.map((example, index) => ({
      example,
      label: labels[index],
    }));
    this.root = this.buildTree(
      rows,
      examples[0]?.map((_value, index) => index) ?? [],
    );
  }

  predict(dataset: number[][]): Label[] {
    return dataset.map(example => this.predictOne(this.root, example));
  }

  toJSON(): DecisionTreeModelData {
    return {
      algorithm: 'id3',
      root: this.root,
    };
  }

  private buildTree(
    rows: TrainingRow[],
    featureIndexes: number[],
  ): DecisionTreeNode {
    const defaultLabel = this.majorityLabel(rows);
    const uniqueLabels = Array.from(new Set(rows.map(row => row.label)));

    if (uniqueLabels.length === 1) {
      return {type: 'leaf', prediction: uniqueLabels[0]};
    }

    if (featureIndexes.length === 0 || rows.length === 0) {
      return {type: 'leaf', prediction: defaultLabel};
    }

    const split = this.bestSplit(rows, featureIndexes);
    if (!split || split.gain <= 0) {
      return {type: 'leaf', prediction: defaultLabel};
    }

    const remainingFeatureIndexes = featureIndexes.filter(
      featureIndex => featureIndex !== split.featureIndex,
    );

    if (split.splitType === 'numerical') {
      const leftRows = rows.filter(
        row => row.example[split.featureIndex] <= split.threshold!,
      );
      const rightRows = rows.filter(
        row => row.example[split.featureIndex] > split.threshold!,
      );
      return {
        type: 'decision',
        featureIndex: split.featureIndex,
        splitType: split.splitType,
        threshold: split.threshold!,
        defaultLabel,
        left: this.buildTree(leftRows, remainingFeatureIndexes),
        right: this.buildTree(rightRows, remainingFeatureIndexes),
      };
    }

    const children: Record<string, DecisionTreeNode> = {};
    this.uniqueFeatureValues(rows, split.featureIndex).forEach(value => {
      const childRows = rows.filter(
        row => row.example[split.featureIndex] === value,
      );
      children[String(value)] = this.buildTree(
        childRows,
        remainingFeatureIndexes,
      );
    });

    return {
      type: 'decision',
      featureIndex: split.featureIndex,
      splitType: split.splitType,
      defaultLabel,
      children,
    };
  }

  private bestSplit(
    rows: TrainingRow[],
    featureIndexes: number[],
  ): SplitCandidate | undefined {
    let best: SplitCandidate | undefined;
    featureIndexes.forEach(featureIndex => {
      const split =
        this.featureTypes[featureIndex] === ColumnTypes.NUMERICAL
          ? this.bestNumericalSplit(rows, featureIndex)
          : this.categoricalSplit(rows, featureIndex);
      if (split && (!best || split.gain > best.gain)) {
        best = split;
      }
    });
    return best;
  }

  private categoricalSplit(
    rows: TrainingRow[],
    featureIndex: number,
  ): SplitCandidate {
    const gain =
      this.entropy(rows) -
      this.uniqueFeatureValues(rows, featureIndex).reduce((sum, value) => {
        const matchingRows = rows.filter(
          row => row.example[featureIndex] === value,
        );
        return sum + (matchingRows.length / rows.length) * this.entropy(matchingRows);
      }, 0);

    return {featureIndex, splitType: 'categorical', gain};
  }

  private bestNumericalSplit(
    rows: TrainingRow[],
    featureIndex: number,
  ): SplitCandidate | undefined {
    const values = this.uniqueFeatureValues(rows, featureIndex).sort(
      (a, b) => a - b,
    );
    if (values.length < 2) {
      return undefined;
    }

    let best: SplitCandidate | undefined;
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2;
      const leftRows = rows.filter(row => row.example[featureIndex] <= threshold);
      const rightRows = rows.filter(row => row.example[featureIndex] > threshold);
      const gain =
        this.entropy(rows) -
        (leftRows.length / rows.length) * this.entropy(leftRows) -
        (rightRows.length / rows.length) * this.entropy(rightRows);

      if (!best || gain > best.gain) {
        best = {featureIndex, splitType: 'numerical', threshold, gain};
      }
    }
    return best;
  }

  private entropy(rows: TrainingRow[]): number {
    if (rows.length === 0) {
      return 0;
    }
    const counts = this.labelCounts(rows);
    return Object.values(counts).reduce((sum, count) => {
      const probability = count / rows.length;
      return sum - probability * Math.log2(probability);
    }, 0);
  }

  private majorityLabel(rows: TrainingRow[]): Label {
    const counts = this.labelCounts(rows);
    let bestLabel = rows[0]?.label ?? '';
    let bestCount = -1;
    rows.forEach(row => {
      const count = counts[String(row.label)];
      if (count > bestCount) {
        bestLabel = row.label;
        bestCount = count;
      }
    });
    return bestLabel;
  }

  private labelCounts(rows: TrainingRow[]): Record<string, number> {
    return rows.reduce<Record<string, number>>((counts, row) => {
      const key = String(row.label);
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});
  }

  private uniqueFeatureValues(rows: TrainingRow[], featureIndex: number): number[] {
    return Array.from(new Set(rows.map(row => row.example[featureIndex])));
  }

  private predictOne(node: DecisionTreeNode, example: number[]): Label {
    if (node.type === 'leaf') {
      return node.prediction;
    }

    const value = example[node.featureIndex];
    if (node.splitType === 'numerical') {
      const child = value <= node.threshold ? node.left : node.right;
      return child ? this.predictOne(child, example) : node.defaultLabel;
    }

    const child = node.children[String(value)];
    return child ? this.predictOne(child, example) : node.defaultLabel;
  }
}

export default class ID3Trainer {
  private store: Store<RootState>;

  constructor(store: Store<RootState>) {
    this.store = store;
  }

  startTraining(store: Store<RootState>): void {
    this.store = store;
    const state = store.getState();
    const trainedModel = this.getModelDetails(state);

    this.storeTrainedModel(store, trainedModel);

    const trainedState = store.getState();
    logMetric('train-model', trainedState);
    this.storeHistoricResult(store, trainedState);
  }

  getModelDetails(state: RootState): TrainedModelResult {
    const featureTypes = state.selectedFeatures.map(
      feature => state.columnsByDataType[feature],
    );
    const model = new ID3Model(
      state.trainingExamples,
      state.trainingLabels,
      featureTypes,
    );
    const predictedLabels = model.predict(state.accuracyCheckExamples);
    return {
      model,
      predictedLabels,
      kValue: null,
    };
  }

  predict(testValues: number[]): void {
    const state = this.store.getState();

    if (state.trainedModel) {
      const predictions = state.trainedModel.predict([testValues]);
      this.store.dispatch(setPrediction(predictions[0]));
    }
  }

  storeTrainedModel(
    store: Store<RootState>,
    trainedModel: TrainedModelResult,
  ): void {
    store.dispatch(setKValue(trainedModel.kValue));
    store.dispatch(
      setAccuracyCheckPredictedLabels(trainedModel.predictedLabels),
    );
    store.dispatch(setTrainedModel(trainedModel.model));
  }

  storeHistoricResult(store: Store<RootState>, state: RootState): void {
    const accuracy = getPercentCorrect(state);
    store.dispatch(
      setHistoricResult(state.labelColumn!, state.selectedFeatures, accuracy),
    );
  }
}

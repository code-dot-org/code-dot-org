/*
  Which trainer a level gets, and which id its saved model records. `mode` is
  whatever JSON an author typed into the level editor, so misspellings count.
*/
import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {getTrainedModelDataToSave} from '@cdo/apps/ailab/engine/selectors/saveSelectors';
import {buildTrainer} from '@cdo/apps/ailab/engine/trainers';
import DecisionTreeTrainer from '@cdo/apps/ailab/engine/trainers/DecisionTreeTrainer';
import KNNTrainer from '@cdo/apps/ailab/engine/trainers/KNNTrainer';
import {initialProject} from '@cdo/apps/ailab/engine/types';

import {levelStore} from './levelStore';

const JEANS = [
  {price: '10', size: '1'},
  {price: '20', size: '2'},
  {price: '80', size: '8'},
  {price: '90', size: '9'},
  {price: '30', size: '3'},
];

const JEANS_COLUMNS = {
  price: ColumnTypes.NUMERICAL,
  size: ColumnTypes.NUMERICAL,
};

// The trainer id comes off the label column's type, so an untrained project
// carrying the right label is enough.
function savedTrainerId(store, label = 'animal') {
  const project = {...initialProject, labelColumn: label};
  return getTrainedModelDataToSave(store.getState(), project).selectedTrainer;
}

describe('trainer selection from mode', () => {
  test('a level with no mode gets the default family', () => {
    expect(buildTrainer(levelStore(undefined))).toBeInstanceOf(KNNTrainer);
  });

  test('a mode without a trainer gets the default family', () => {
    expect(buildTrainer(levelStore({datasets: ['zoo']}))).toBeInstanceOf(
      KNNTrainer
    );
  });

  test('a level naming the decision tree gets it', () => {
    expect(buildTrainer(levelStore({trainer: 'decisionTree'}))).toBeInstanceOf(
      DecisionTreeTrainer
    );
  });

  test('a level naming knn gets it', () => {
    expect(buildTrainer(levelStore({trainer: 'knn'}))).toBeInstanceOf(
      KNNTrainer
    );
  });

  test.each(['decisionTre', '', 'toString', 'constructor', '__proto__'])(
    'an unrecognized trainer %j falls back rather than throwing',
    trainer => {
      expect(buildTrainer(levelStore({trainer}))).toBeInstanceOf(KNNTrainer);
    }
  );
});

describe('the trainer id recorded on a saved model', () => {
  test('a decision tree level records the tree ids', () => {
    const mode = {trainer: 'decisionTree'};

    expect(savedTrainerId(levelStore(mode))).toBe('treeClassify');
    expect(
      savedTrainerId(levelStore(mode, JEANS, JEANS_COLUMNS, 'price'), 'price')
    ).toBe('treeRegress');
  });

  test('a knn level records the knn ids', () => {
    expect(savedTrainerId(levelStore(undefined))).toBe('knnClassify');
    expect(
      savedTrainerId(
        levelStore(undefined, JEANS, JEANS_COLUMNS, 'price'),
        'price'
      )
    ).toBe('knnRegress');
  });

  test('an unrecognized trainer records the default family ids', () => {
    expect(savedTrainerId(levelStore({trainer: 'randomForest'}))).toBe(
      'knnClassify'
    );
  });
});

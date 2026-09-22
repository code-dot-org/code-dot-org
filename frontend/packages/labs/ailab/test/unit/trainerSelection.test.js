/*
  Which trainer a level gets, and which id its saved model records.

  `mode` reaches the store as whatever JSON a curriculum author typed into the
  level editor, so these cover the names nobody meant to write as well as the
  ones they did.
*/
import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import rootReducer, {
  addSelectedFeature,
  getTrainedModelDataToSave,
  setColumnsByDataType,
  setImportedData,
  setLabelColumn,
  setMode,
} from '../../src/redux';
import {buildTrainer} from '../../src/trainers';
import DecisionTreeTrainer from '../../src/trainers/DecisionTreeTrainer';
import KNNTrainer from '../../src/trainers/KNNTrainer';

const CATEGORICAL = ColumnTypes.CATEGORICAL;
const NUMERICAL = ColumnTypes.NUMERICAL;

const ANIMALS = [
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
  {animal: 'snake', legs: '0'},
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
];

const JEANS = [
  {price: '10', size: '1'},
  {price: '20', size: '2'},
  {price: '80', size: '8'},
  {price: '90', size: '9'},
  {price: '30', size: '3'},
];

// Builds the store a level would have once its label and features are chosen.
function levelStore(mode, data = ANIMALS, label = 'animal', columns) {
  const store = createStore(rootReducer);
  const types = columns || {animal: CATEGORICAL, legs: NUMERICAL};

  store.dispatch(setMode(mode));
  store.dispatch(setImportedData(data, false));
  Object.entries(types).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type)),
  );
  store.dispatch(setLabelColumn(label));
  Object.keys(types)
    .filter(column => column !== label)
    .forEach(column => store.dispatch(addSelectedFeature(column)));

  return store;
}

describe('trainer selection from mode', () => {
  test('a level with no mode gets the default family', () => {
    expect(buildTrainer(levelStore(undefined))).toBeInstanceOf(KNNTrainer);
  });

  test('a mode without a trainer gets the default family', () => {
    expect(buildTrainer(levelStore({datasets: ['zoo']}))).toBeInstanceOf(
      KNNTrainer,
    );
  });

  test('a level naming the decision tree gets it', () => {
    expect(buildTrainer(levelStore({trainer: 'decisionTree'}))).toBeInstanceOf(
      DecisionTreeTrainer,
    );
  });

  test('a level naming knn gets it', () => {
    expect(buildTrainer(levelStore({trainer: 'knn'}))).toBeInstanceOf(
      KNNTrainer,
    );
  });

  /*
    The editor takes free text, so a typo must not take the level down with it.
    Without the guard this throws, because the dispatch table has no such key.
  */
  test('an unrecognized trainer falls back rather than throwing', () => {
    expect(buildTrainer(levelStore({trainer: 'decisionTre'}))).toBeInstanceOf(
      KNNTrainer,
    );
    expect(buildTrainer(levelStore({trainer: ''}))).toBeInstanceOf(KNNTrainer);
  });
});

describe('the trainer id recorded on a saved model', () => {
  /*
    App Lab reloads the saved blob with the algorithm this id names, so a tree
    saved under a KNN id is a model no reader can open.
  */
  test('a decision tree level records the tree ids', () => {
    const classify = levelStore({trainer: 'decisionTree'});
    expect(getTrainedModelDataToSave(classify.getState()).selectedTrainer).toBe(
      'treeClassify',
    );

    const regress = levelStore({trainer: 'decisionTree'}, JEANS, 'price', {
      price: NUMERICAL,
      size: NUMERICAL,
    });
    expect(getTrainedModelDataToSave(regress.getState()).selectedTrainer).toBe(
      'treeRegress',
    );
  });

  test('a knn level records the knn ids', () => {
    const classify = levelStore(undefined);
    expect(getTrainedModelDataToSave(classify.getState()).selectedTrainer).toBe(
      'knnClassify',
    );

    const regress = levelStore(undefined, JEANS, 'price', {
      price: NUMERICAL,
      size: NUMERICAL,
    });
    expect(getTrainedModelDataToSave(regress.getState()).selectedTrainer).toBe(
      'knnRegress',
    );
  });

  // The class that trains and the id that is saved read the same setting.
  test('an unrecognized trainer records the default family ids', () => {
    const store = levelStore({trainer: 'randomForest'});
    expect(getTrainedModelDataToSave(store.getState()).selectedTrainer).toBe(
      'knnClassify',
    );
  });
});

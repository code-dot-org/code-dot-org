import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import rootReducer, {
  setColumnsByDataType,
  setImportedData,
  setMode,
} from '../../src/redux';
import {initialProject} from '../../src/types';

// `legs` fixes `animal`, so a trained model reaches 100%.
export const ANIMALS = [
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
  {animal: 'snake', legs: '0'},
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
  {animal: 'snake', legs: '0'},
  {animal: 'bird', legs: '2'},
  {animal: 'dog', legs: '4'},
  {animal: 'snake', legs: '0'},
  {animal: 'dog', legs: '4'},
];

export const ANIMAL_COLUMNS = {
  animal: ColumnTypes.CATEGORICAL,
  legs: ColumnTypes.NUMERICAL,
};

export function levelStore(mode, data = ANIMALS, columns = ANIMAL_COLUMNS) {
  const store = createStore(rootReducer);

  store.dispatch(setMode(mode));
  store.dispatch(setImportedData(data, false));
  Object.entries(columns).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type)),
  );

  return store;
}

// The columns a level opens with: every one except the label is a feature.
export function levelProject(columns = ANIMAL_COLUMNS, label = 'animal') {
  return {
    ...initialProject,
    labelColumn: label,
    selectedFeatures: Object.keys(columns).filter(column => column !== label),
  };
}

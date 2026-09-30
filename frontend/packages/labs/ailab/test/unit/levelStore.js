import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import rootReducer, {
  addSelectedFeature,
  setColumnsByDataType,
  setImportedData,
  setLabelColumn,
  setMode,
} from '../../src/redux';

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

// Every column except the label is selected as a feature.
export function levelStore(
  mode,
  data = ANIMALS,
  columns = ANIMAL_COLUMNS,
  label = 'animal',
) {
  const store = createStore(rootReducer);

  store.dispatch(setMode(mode));
  store.dispatch(setImportedData(data, false));
  Object.entries(columns).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type)),
  );
  store.dispatch(setLabelColumn(label));
  Object.keys(columns)
    .filter(column => column !== label)
    .forEach(column => store.dispatch(addSelectedFeature(column)));

  return store;
}

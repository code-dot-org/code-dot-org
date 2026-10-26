import {createStore} from 'redux';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import rootReducer, {
  setCurrentPanel,
  setDatasetLoaded,
  setMode,
} from '@cdo/apps/ailab/engine/redux';
import {defaultProject} from '@cdo/apps/ailab/engine/types';

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

export function seedLevel(
  store,
  mode,
  data = ANIMALS,
  columns = ANIMAL_COLUMNS
) {
  store.dispatch(setMode(mode));
  store.dispatch(setCurrentPanel('datasetView'));
  store.dispatch(
    setDatasetLoaded({
      dataset: {
        rows: data,
        metadata: {card: {}},
        columnsByDataType: columns,
        removedRowsCount: 0,
      },
    })
  );

  return store;
}

export function levelStore(...level) {
  return seedLevel(createStore(rootReducer), ...level);
}

// The columns a level opens with: every one except the label is a feature.
export function levelProject(columns = ANIMAL_COLUMNS, label = 'animal') {
  return {
    ...defaultProject,
    labelColumn: label,
    selectedFeatures: Object.keys(columns).filter(column => column !== label),
  };
}

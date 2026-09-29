/* Trains on a shipped dataset through the real store, as a level does. */
import fs from 'fs';
import path from 'path';

import {ColumnTypes, TestDataLocations} from '../../src/constants';
import {parseCSV} from '../../src/csvReaderWrapper';
import {getKeyByValue} from '../../src/helpers/utils';
import {convertValueForTraining} from '../../src/helpers/valueConversion';
import {
  addSelectedFeature,
  resetState,
  setColumnsByDataType,
  setImportedMetadata,
  setLabelColumn,
  setMode,
  setReserveLocation,
  setSelectedCSV,
  setSelectedJSON,
} from '../../src/redux';
import {store} from '../../src/store';
import train from '../../src/train';

const DIR = path.join(__dirname, '../../public/datasets');

// Every column except the label is a feature unless `features` names them.
export function trainDataset(
  id,
  {label, features, mode = {trainer: 'decisionTree'}} = {},
) {
  const csv = fs.readFileSync(path.join(DIR, `${id}.csv`), 'utf8');
  const metadata = JSON.parse(
    fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'),
  );

  store.dispatch(resetState());
  train.reset();
  store.dispatch(setMode(mode));
  store.dispatch(setSelectedCSV(`${id}.csv`));
  store.dispatch(setSelectedJSON(`${id}.json`));
  parseCSV(csv, false, false);
  store.dispatch(setImportedMetadata(metadata));
  metadata.fields.forEach(field =>
    store.dispatch(
      setColumnsByDataType(field.id, field.type || ColumnTypes.CATEGORICAL),
    ),
  );
  store.dispatch(setReserveLocation(TestDataLocations.END));
  const labelColumn = label || metadata.defaultLabelColumn;
  store.dispatch(setLabelColumn(labelColumn));
  (
    features ||
    Object.keys(store.getState().data[0]).filter(
      column => column !== labelColumn,
    )
  ).forEach(column => store.dispatch(addSelectedFeature(column)));

  train.init(store);
  train.onClickTrain();
  return store.getState();
}

// The model's own prediction for every row, as label values.
export function modelPredictions(state) {
  const rows = state.data.map(row =>
    state.selectedFeatures.map(feature =>
      convertValueForTraining(state, row[feature], feature),
    ),
  );
  const labelKey = state.featureNumberKey[state.labelColumn];
  return state.trainedModel
    .predict(rows)
    .map(prediction =>
      labelKey ? getKeyByValue(labelKey, prediction) : prediction,
    );
}

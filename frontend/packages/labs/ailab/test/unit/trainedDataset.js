/* Trains on a shipped dataset through the real store, as a level does. */
import fs from 'fs';
import path from 'path';

import {ColumnTypes, TestDataLocations} from '../../src/constants';
import {parseCSV} from '../../src/csvReaderWrapper';
import {traceDisplayTree} from '../../src/helpers/displayTreeTrace';
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
import {getDisplayTree} from '../../src/selectors/visualizationSelectors';
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

// Every row as the numbers the model reads.
export function modelInputs(state) {
  return state.data.map(row =>
    state.selectedFeatures.map(feature =>
      convertValueForTraining(state, row[feature], feature),
    ),
  );
}

// The model's own prediction for every row, as label values.
export function modelPredictions(state) {
  const labelKey = state.featureNumberKey[state.labelColumn];
  return state.trainedModel
    .predict(modelInputs(state))
    .map(prediction =>
      labelKey ? getKeyByValue(labelKey, prediction) : prediction,
    );
}

// The trace of every row, as a prediction of that row would give.
export function rowTraces(state) {
  const tree = getDisplayTree(state);
  const {root} = state.trainedModel.toJSON();
  const inputs = modelInputs(state);
  return state.data.map((row, index) =>
    traceDisplayTree(tree, root, inputs[index], row),
  );
}
